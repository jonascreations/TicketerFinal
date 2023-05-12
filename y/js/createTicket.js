

const createTicketForm = document.getElementById("create-ticket-form");
const emailInput = document.getElementById("email-input");

createTicketForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const workerEmailsInput = document.getElementById("worker-emails");
    const workerEmails = workerEmailsInput.value.split(",");
    
    const subjectInput = document.getElementById("subject");
    const subject = subjectInput.value;
    
    const descriptionInput = document.getElementById("description");
    const description = descriptionInput.value;
    
    const departmentInput = document.getElementById("department");
    const department = departmentInput.value;
    
    const priorityInput = document.getElementById("priority");
    const priority = priorityInput.value;
    
    const createTicket = firebase.functions().httpsCallable("createTicket");
    try{
        const result = await createTicket({
            workerEmails: workerEmails,
            subject: subject,
            description: description,
            department: department,
            priority: priority,
          });
          console.log("Ticket created successfully:", result.data.key);
          //console.log(result.data.key);
          const addTicketToUsers = firebase.functions().httpsCallable('addTicketToUsers');
addTicketToUsers({ workerEmails: workerEmails, ticketId: result.data.key })
  .then((result) => {
    console.log("Ticket added to user(s) successfully!");
  })
  .catch((error) => {
    console.error("Error adding ticket to user(s):", error);
  });

          
  } catch (error) {
    console.error("Error creating ticket:", error);
  }
    
 
  });

