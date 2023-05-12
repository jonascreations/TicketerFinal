let app;

document.addEventListener('DOMContentLoaded', event => {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log("attempting to remount");
      // User is signed in, load the Vue app
      app = Vue.createApp({
        data() {
          return {
            tickets: [],
            showDeleted: false,
            selectedTicket: null,
            ticketCopy: {}
          }
        },
        methods: {
          isAllowedToView() {//this either shows elements if they are manager or not
            if (position === 'manager' || this.ticketCopy.creatorId === userIDHold) {//uses global variables in the auth.js section
              console.log("in isAllowedToView");
              return true;
            } else {
              return false;
            }
          },
          toggleDeleted() {
            console.log("clicked toggle deleted");
            this.showDeleted = !this.showDeleted;
          },
          orderByPriority() {//havent gotten this to work yet
            this.tickets.sort((a, b) => {
              const priorityA = parseInt(a.priority);
              const priorityB = parseInt(b.priority);
          
              if (priorityA < priorityB) {
                return -1;
              } else if (priorityA > priorityB) {
                return 1;
              } else {
                return 0;
              }
            });
          },
          selectTicket(ticket) {//sets a ticket copy
            this.selectedTicket = ticket;
            this.ticketCopy = JSON.parse(JSON.stringify(ticket));
          },
          updateTicket() {//i have two of these
            console.log(this.ticketCopy);
            updateTicket(this.ticketCopy)
              .then(result => {
                console.log(result.data.message);
                const index = this.tickets.findIndex(ticket => ticket.ticketId === this.selectedTicket.ticketId);
                this.tickets.splice(index, 1, this.ticketCopy);
                this.selectedTicket = null;
                this.ticketCopy = null;
              })
              .catch(error => {
                console.error(error);
              });
          },
          clickDelete() {
            if (this.selectedTicket) {
              deleteTicket(this.selectedTicket.ticketId)
                .then(result => {
                  console.log(result.data.message);
                })
                .catch(error => {
                  console.error(error);
                });
            }
          },
          closeForm() {
            this.selectedTicket = null;
          },
          getAndSetTickets(){
            getTickets().then(tickets => {
                this.tickets = tickets;
                this.ticketCopy = this.tickets;
                this.orderByPriority
              }).catch(error => {
                console.error(error);
              });
          },
          createTicketsBtn(){//i will call a modal script for this
            toggleEmailVisibility();
            toggleCreateDisplay();
          },
        },
        
        updateTicket() {// this might not be needed
            updateTicket(this.ticketCopy)
      .then(() => {
        this.selectedTicket = null;
        this.ticketCopy = null;
      })
      .catch(error => {
        console.error(error);
      });
  
          },
        computed: {
          filteredTickets() {
            if (this.showDeleted) {
              return this.tickets.filter(ticket => ticket.deleted);
            } else {
              return this.tickets.filter(ticket => !ticket.deleted);
            }
          }
        },              
        mounted() {
          // Call the getTickets function and update the tickets data
          
            this.getAndSetTickets();
            const database = firebase.database();
            const ticketsRef = database.ref('tickets');
            ticketsRef.on('value', snapshot => {
            // Call the getAndSetTickets method whenever there is a change to the 'tickets' node
            this.getAndSetTickets();
            });
          /*getTickets().then(tickets => {
            this.tickets = tickets;
          }).catch(error => {
            console.error(error);
          });*/
        }
      });
      app.mount('#app');
    } else {
      // User is signed out, unmount the Vue app
      if (app) {
        app.unmount();
      }
    }
  });
});


  //update ticket
  function updateTicket(ticketCopy) {
    const updateTicket = firebase.functions().httpsCallable('updateTicket');
    console.log("inside update ticket");
    console.log(ticketCopy);
    console.log(JSON.stringify(ticketCopy));
    console.log("---------------------------");
    console.log(ticketCopy.ticketId);
    console.log(ticketCopy.title);
    console.log(ticketCopy.status);
    console.log(ticketCopy.priority);
    console.log(ticketCopy.description);
    console.log(ticketCopy.department);
    return updateTicket({
        ticketCopy: {
          ticketId: ticketCopy.ticketId,
          title: ticketCopy.title,
          status: ticketCopy.status,
          priority: ticketCopy.priority,
          description: ticketCopy.description,
          department: ticketCopy.department,
        }
      })      
    .then(result => {
      console.log(result.data.message);
    })
    .catch(error => {
      console.error(error);
    });
  }
  //delete ticket
  function deleteTicket(ticketId) {
    const deleteTicketCallable = firebase.functions().httpsCallable('deleteTicket');
    return deleteTicketCallable({ ticketId })
      .then(result => {
        console.log(result.data.message);
      })
      .catch(error => {
        console.error(error);
      });
  }
  