/* eslint-disable max-len */
const functions = require("firebase-functions");
const admin = require("firebase-admin");// for all apps
admin.initializeApp();

// this gets a list of id's from a list emails
exports.getEmailUids = functions.https.onCall(async (data, context) => {
  const emails = data.emails;
  const database = admin.database();
  const ref = database.ref("users");

  const uidList = [];
  await Promise.all(
      emails.map(async (email) => {
        const snapshot = await ref.orderByChild("email").equalTo(email).once("value");
        if (snapshot.exists()) {
          const uid = Object.keys(snapshot.val())[0];
          uidList.push(uid);
        }
      }),
  );
  return uidList;
});

// this gets all ticket's data
exports.getUserTickets = functions.https.onCall(async (data, context) => {
  const database = admin.database();// likely not needed
  const ticketIds = data.ticketIds;
  const ticketsRef = database.ref("tickets");
  const ticketsData = [];
  for (const ticketId of ticketIds) {
    const ticketRef = ticketsRef.child(ticketId);
    const snapshot = await ticketRef.once("value");
    const ticketData = snapshot.val();
    ticketsData.push(ticketData);
  }

  // Return ticket data
  return {tickets: ticketsData};
});


// this updates a ticket
exports.updateTicket = functions.https.onCall((data, context) => {
  const {ticketCopy} = data;
  const {ticketId, title, status, priority, description, department} = ticketCopy;
  const ticketRef = admin.database().ref(`/tickets/${ticketId}`);

  ticketRef.once("value", (snapshot) => {
    const ticket = snapshot.val();
    console.log("Ticket found:", ticket);
  });

  return ticketRef.update({
    title: title,
    status: status,
    priority: priority,
    description: description,
    department: department,
  })
      .then(() => {
        return {message: "Ticket updated"};
      })
      .catch((error) => {
        throw new functions.https.HttpsError("internal", error.message);
      });
});


// use this to delete
exports.deleteTicket = functions.https.onCall((data, context) => {
  const ticketId = data.ticketId;

  return admin.database().ref(`/tickets/${ticketId}`).update({
    deleted: true,
  })
      .then(() => {
        return {
          message: `Ticket ${ticketId} deleted`,
        };
      })
      .catch((error) => {
        throw new functions.https.HttpsError("unknown", error.message, error);
      });
});

// this adds tickets to the users who are named in the create ticket
exports.addTicketToUsers = functions.https.onCall(async (data, context) => {
  const {workerEmails, ticketId} = data;
  const database = admin.database();// likely not needed
  const clientTicketRef = database.ref(`users/${context.auth.uid}/tickets`);// sets ref to the userid
  await clientTicketRef.child(ticketId).set(true);// sets ticket to the calling user
  for (const email of workerEmails) {
    const queryRef = database.ref("users").orderByChild("email").equalTo(email);
    const snapshot = await queryRef.once("value");
    if (snapshot.exists()) {
      const userId = Object.keys(snapshot.val())[0];
      const userTicketsRef = database.ref(`users/${userId}/tickets`);
      await userTicketsRef.child(ticketId).set(true);
      console.log(`Ticket ID ${ticketId} added to user with email ${email}`);
    } else {
      console.error(`No user found with email ${email}`);
    }
  }

  // Return a response back to the client
  return {message: "Ticket added to user(s) successfully!"};
});

// this just retrieves a list of the ticket id's in a user's data
exports.getUserTicketIds = functions.https.onCall(async (data, context) => {
  const database = admin.database();// likely not needed
  const userTicketsRef = database.ref(`users/${context.auth.uid}/tickets`);
  const userTicketsSnapshot = await userTicketsRef.once("value");
  const ticketIds = Object.keys(userTicketsSnapshot.val());
  return {ticketIds: ticketIds};
});

// this checks if a ticket exists in the user's ticket directory in the realtime tree
exports.checkUserTicket = functions.https.onCall(async (data, context) => {
  const ticketId = data.ticketId;
  const database = admin.database();// likely not needed
  const userTicketsRef = database.ref(`users/${context.auth.uid}/tickets`);
  const snapshot = await userTicketsRef.child(ticketId).once("value");
  const exists = snapshot.exists();
  return {exists};
});

// this creates a ticket from the fields given
exports.createTicket = functions.https.onCall(async (data, context) => {
  const userEmailRef = admin.database().ref(`users/${context.auth.uid}/email`);
  const userEmailSnapshot = await userEmailRef.once("value");
  const userEmail = userEmailSnapshot.val();

  const {workerEmails, subject, description, department, priority} = data;


  const database = admin.database();
  const ref = database.ref("tickets");
  const newTicketRef = ref.push();

  const ticketData = {
    ticketId: newTicketRef.key,
    title: subject,
    description: description,
    status: false,
    deleted: false,
    creatorId: context.auth.uid,
    creatorName: userEmail.split("@")[0],
    workerEmail: workerEmails,
    department: department,
    priority: priority,
  };


  // Set the new ticket data at the generated key in the database
  await newTicketRef.set(ticketData);
  // Log the ID of the newly created ticket
  console.log("ticket created with ID: ", newTicketRef.key);
  return {key: newTicketRef.key};
});
// a test to get a specific user's tickets
exports.getTicket = functions.https.onCall(async (data, context) => {
  const ticketId = data.ticketId;
  const database = admin.database();
  const ref = database.ref(`users/BMcgxojJDGOfuSCdh1wKvYDb68O2/tickets`);
  const ticketRef = ref.child(ticketId);
  const snapshot = await ticketRef.once("value");
  const ticketData = snapshot.val();
  return {ticket: ticketData};
});

exports.assignPosition = functions.https.onCall((data, context) => {
  const {uid, position, email} = data;
  return admin.database().ref(`users/${uid}`).set({
    email,
    position,
  }).then(() => {
    console.log(`Position '${position}' ID '${uid}'Realtime Database.`);
  }).catch((error) => {
    throw new functions.https.HttpsError("Error assigning user", error.message);
  });
});

// this is just a test function to see if i can retrieve tickets
exports.getAllTicketIds = functions.https.onCall(async (data, context) => {
  const database = admin.database();
  const ticketsRef = database.ref("tickets");
  const ticketsSnapshot = await ticketsRef.once("value");
  const ticketIds = Object.keys(ticketsSnapshot.val());
  return {ticketIds: ticketIds};
});

// another test
exports.getAllTicketData = functions.https.onCall(async (data, context) => {
  const database = admin.database();
  const ticketIds = data.ticketIds;
  const tickets = [];
  for (const ticketId of ticketIds) {
    const ticketsRef = database.ref("tickets");
    const ticketRef = ticketsRef.child(ticketId);
    const snapshot = await ticketRef.once("value");
    const ticketData = snapshot.val();
    tickets.push(ticketData);
  }

  return {tickets: tickets};
});

// this returns the user's position
exports.getUserPosition = functions.https.onCall(async (data, context) => {
  const {userId} = data;
  const database = admin.database();
  const userRef = database.ref(`users/${userId}/position`);
  const snapshot = await userRef.once("value");
  const position = snapshot.val();

  // Return the user position
  return {position};
});
