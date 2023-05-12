
//checks if user is manager
function isWorkerOrManager(){
  return position === "manager";
}




//changes whether or not user can see the email input in create ticket modal
function toggleEmailVisibility() {
  const element = document.getElementById('worker-emails');

  if (isWorkerOrManager()) {
    element.style.display = 'block'; // Show the element
  } else {
    element.style.display = 'none'; // Hide the element
  }
}

//this switches between the login and register modals
function switchBetweenLoginAndRegister() {
  const loginForm = document.getElementById('login');
  const registerForm = document.getElementById('register');

  if (loginForm.style.display === 'none') {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
  } else {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
  }
}
//this toggles whether or not the create ticket modal is shown
function toggleCreateDisplay() {
  const element = document.getElementById('createTicket');

  if (element.style.display === 'none') {
    element.style.display = 'block';
  } else {
    element.style.display = 'none';
  }
}
function toggleChangePassDisplay() {
  const element = document.getElementById('changePass');

  if (element.style.display === 'none') {
    element.style.display = 'block';
  } else {
    element.style.display = 'none';
  }
}