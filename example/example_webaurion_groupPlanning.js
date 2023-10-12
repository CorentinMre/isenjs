const Client = require("isenjs");

// Create the client
const client = new Client("<username>", "<password>");
(async () => {
  try {
    const logged_in = await client.logged_in; // don't this line for login the user
    if (!logged_in) {
      console.error("Login failed");
      return;
    }

    const webAurion = await client.webAurion();

    // params: cycle : str , year : str, city: str, start_date : (str, optional) , end_date : (str, optional)
    // format (Ex. "12-08-2023")
    // default : the current week
    const groupPlanning = await webAurion.groupPlanning(
      "CIR",
      "2",
      "Caen",
      "16-08-2023",
      "16-05-2024"
    );

    console.log(groupPlanning);
    //console.log(groupPlanning.toJSON()); // to have the Object
  } catch (error) {
    console.error("Error:", error);
  }
})();
