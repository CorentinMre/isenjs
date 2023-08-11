
const Client = require('isenjs'); // Assuming the package is available as 'isenjs'

// Create the client
const client = new Client();

client.classMember("CIR", "2", "Caen")
  .then(classMember => {
    console.log(classMember);
  })
  .catch(error => {
    console.error("An error occurred:", error);
  });
