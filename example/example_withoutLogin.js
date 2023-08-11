

import Client from 'isenjs';


// Create the client
const client = new Client();


let classMember = await client.classMember("CIR", "2", "Caen");

console.log(classMember);



