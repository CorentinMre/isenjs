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

    const schoolReport = await client.getSchoolReport();

    console.log(schoolReport);
    //console.log(schoolReport.toJSON()); // to have the Object

    // and for download the pdf
    // await schoolReport.downloadReport("path/to/save.pdf", "id_of_the_report");
  } catch (error) {
    console.error("Error:", error);
  }
})();
