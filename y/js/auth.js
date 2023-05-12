let position = null; // global variable of position
let userIDHold = null;

//change password code
const changePasswordBtn = document.getElementById('changePasswordBtn');
changePasswordBtn.addEventListener('click', changePassword);
function changePassword() {
  const newPassword = document.getElementById('newPassword').value;
  const user = firebase.auth().currentUser;
  user.updatePassword(newPassword)
    .then(() => {
      console.log('Password updated successfully');
    })
    .catch((error) => {
      console.error('Error updating password', error);
    });
}



//gets user position
function getUserPosition(userId) {
  const getUserPositionFn = firebase.functions().httpsCallable("getUserPosition");

  getUserPositionFn({ userId })
    .then((result) => {
      position = result.data.position;
      console.log("User Position:", position);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

//this initializes if modals are shown or not 

const loginForm = document.getElementById('loginForm');
document.addEventListener('DOMContentLoaded', () => {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log('User is logged in with ID:', user.uid);
      console.log("yer");
      document.getElementById("login").style.display = "none";
      document.getElementById("register").style.display = "none";
      document.getElementById("signOut").style.display = "block";
      document.getElementById("updateTicket").style.display = "block";
      document.getElementById("changePassBtn").style.display = "block";
      setTimeout(() => {
        getUserPosition(user.uid);
      }, 1000); 
      
      userIDHold = user.uid;
    } else {
      console.log('User is logged out.');
      document.getElementById("login").style.display = "block";
      
      
    }
  });
});
//this is for the signout button
function signOutAndRefresh() {
  firebase.auth().signOut().then(() => {
    location.reload();
  }).catch((error) => {
    console.log("Error signing out:", error);
  });
}

//login to account
loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          console.log("User logged in with ID: ", user.uid);
        })
        .catch((error) => {
          const errorMessage = error.message;
          console.error(errorMessage);
        });
  });


  const registerForm = document.getElementById('registerForm');
  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    console.log("inside registerForm");
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const position = document.getElementById("register-position").value;
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("New user with ID", user.uid, "created successfully");
  
        const assignPosition = firebase.functions().httpsCallable('assignPosition');
        assignPosition({ uid: user.uid, position: position, email: email })
          .then((result) => {
            console.log("Position field assigned");
          })
          .catch((error) => {
            console.error("Error assigning position", error);
          });
      })
      .catch((error) => {
        console.error("Error creating the user", error);
      });
  });
  