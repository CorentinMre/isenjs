
const Client = require('isenjs');

// Create the client
const client = new Client();

(async () => {
  try {

      const classMember = await client.classMember("CIR", "2", "Caen")

      console.log(classMember);
      // console.log(classMember.toJSON()); // to have the Object


  } catch (error) {
      console.error("Error:", error);
  }
})();


// OR symply
// client.classMember("CIR", "2", "Caen")
//   .then(classMember => {
//     console.log(classMember);
//      // console.log(classMember.toJSON()); to have the Object
//   })
//   .catch(error => {
//     console.error("An error occurred:", error);
//   });
