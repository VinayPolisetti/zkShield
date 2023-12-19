fetch('http://localhost:5000/api/auth', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'your_username',
    message: 'authentication',
    signedMessage: 'your_signed_message',
    primaryWalletAddress: 'your_wallet_address',
    password: 'your_password',
  }),
})
  .then(response => response.json())
  .then(data => console.log('Success:', data))
  .catch(error => console.error('Error:', error));
