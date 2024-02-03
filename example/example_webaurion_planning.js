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

    // params: start_date : (str, optional) , end_date : (str, optional)
    // format (Ex. "12-08-2023")
    // default : the current week
    const planning = await client.planning();

    console.log(planning);
    //console.log(planning.toJSON()); // to have the Object
  } catch (error) {
    console.error("Error:", error);
  }
})();
