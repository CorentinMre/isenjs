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

    const grades = await client.grades();
    console.log(grades);
    // console.log(grades.toJSEON()); // to have the Object
  } catch (error) {
    console.error("Error:", error);
  }
})();
