
const Client = require('isenjs');


// Create the client
const client = new Client("username", 
                          "password"
                         );

//check if logged in
client.logged_in.then((logged_in) => {
    console.log(logged_in);
});

