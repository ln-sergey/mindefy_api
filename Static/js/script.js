// handle form submission
const form = document.querySelector('form');
form.addEventListener('submit', (e) => {
  e.preventDefault(); // prevent form from submitting
  const name = form.name.value;
  const email = form.email.value;
  // call function to sign up user for bot
  signUp(name, email);
  form.reset();
});

// function to sign up user for bot
function signUp(name, email) {
  // make HTTP request to sign up endpoint
  const endpoint = 'https://t.me/positive_training_tg_bot';
  const data = { name, email };
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  };
  fetch(endpoint, options)
    .then(response => response.json())
    .then(data => {
      console.log('Sign-up successful', data);
      alert('Sign-up successful! You will receive a message from the Positive Thinking Bot shortly.');
    })
    .catch(error => {
      console.error('Sign-up failed', error);
      alert('Sign-up failed. Please try again later.');
    });
}
