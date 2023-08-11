

import Client from "../lib/index.js";


// Create the client
const client = new Client("username", 
                          "password"
                         );

//check if logged in
if (!(await client.logged_in)){
    console.log("Username or password incorrect");
}


let classMember = await client.classMember("CIR", "2", "Caen");

console.log(classMember);



