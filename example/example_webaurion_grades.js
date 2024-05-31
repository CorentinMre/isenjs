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

    const grades = await client.getGrades();
    console.log(grades);
    // console.log(grades.toJSON()); // to have the Object
  } catch (error) {
    console.error("Error:", error);
  }
})();
