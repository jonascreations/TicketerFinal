

//checks if there is a ticket that exists in user
const ticketExistsInUserTickets = async (ticketId) => {
  try {
    const result = await firebase.functions().httpsCallable('checkUserTicket')({ ticketId });
    const { exists } = result.data;
    console.log(`Ticket exists in user's tickets: ${exists}`);
    return exists;
  } catch (error) {
    console.error(error);
    return false;
  }
};


// ----------------without this seperated i get a origin error for some reason-----
//this gets all the tickets of a user.

//get all the tickets for the user
async function getTickets() {
  console.log('inside getTickets');
  try {
    const userTicketIds = await firebase.functions().httpsCallable('getUserTicketIds')();
    const { ticketIds } = userTicketIds.data;

    const ticketsData = await firebase.functions().httpsCallable('getAllTicketData')({ ticketIds });
    const { tickets } = ticketsData.data;

    // Remove any null values from the tickets array
    const filteredTickets = tickets.filter(ticket => ticket !== null);
    
    console.log(filteredTickets);
    return filteredTickets;
  } catch (error) {
    console.error(error);
    return [];
  }
}


//get the user id's
async function getUserTicketIds() {
  const userTicketIds = await firebase.functions().httpsCallable('getUserTicketIds')();
  return userTicketIds.data.ticketIds;
}
//get the data inside all the user id tickets
async function getAllTicketData(ticketIds) {
  const ticketsData = await firebase.functions().httpsCallable('getAllTicketData')({ ticketIds });
  return ticketsData.data.tickets;
}

//---------------------------------------

// Create a new Firebase Functions reference(test)
returnTicketBtn.addEventListener('click', () => {
const getTicket = firebase.functions().httpsCallable('getTicket');
// Call the 'getTicket' function with a specified ticket ID
console.log('im here');
getTicket({ ticketId: '-NUr44z3yctj3I87WMVI' })
  .then((result) => {
    const ticketData = result.data.ticket;
    console.log('Ticket data:', ticketData);
  })
  .catch((error) => {
    console.error('Error getting ticket data:', error);
  });
});
