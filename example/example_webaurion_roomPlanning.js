const { WebAurion } = require("isenjs");

// Create the client
const client = new WebAurion("<username>", "<password>");
(async () => {
  try {
    const logged_in = await client.logged_in; // don't this line for login the user
    if (!logged_in) {
      console.error("Login failed");
      return;
    }

    // params: city: str, start_date : (str, optional) , end_date : (str, optional)
    // format (Ex. "12-08-2023")
    // default : the current week
    const roomPlanning = await client.roomPlanning(
      "Caen",
      "16-08-2023",
      "16-05-2024",
    );

    console.log(roomPlanning);
    //console.log(roomPlanning.toJSON()); // to have the Object
  } catch (error) {
    console.error("Error:", error);
  }
})();
