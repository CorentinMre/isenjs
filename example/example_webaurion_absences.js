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

    const absences = await client.getAbsences();
    console.log(absences);
    // console.log(absences.toJSON()); // to have the Object
  } catch (error) {
    console.error("Error:", error);
  }
})();
