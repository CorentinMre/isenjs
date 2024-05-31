const { WebAurion } = require("isenjs");

// Create the client
const client = new WebAurion();
(async () => {
  try {
    
    await client.login("<username>", "<password>");

    if (!client.logged_in) {
      console.error("Login failed");
      return;
    }


    const planning = await client.planning();

    console.log(planning);
    //console.log(planning.toJSON()); // to have the Object
  } catch (error) {
    console.error("Error:", error);
  }
})();
