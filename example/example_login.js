

import Client from 'isenjs';


// Create the client
const client = new Client("username", 
                          "password"
                         );

//check if logged in
if (!(await client.logged_in)){
    console.log("Username or password incorrect");
}
