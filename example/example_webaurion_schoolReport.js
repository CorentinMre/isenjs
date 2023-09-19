
const Client = require('isenjs');

// Create the client
const client = new Client("<username>", 
                          "<password>"
                         );
(async () => {
    try {

        await client.init();

        if (!client.logged_in) {
            console.error("Login failed");
            return;
        }

        const webAurion = await client.webAurion();

        const schoolReport = await webAurion.getSchoolReport();

        console.log(schoolReport);
        //console.log(schoolReport.toJSON()); // to have the Object

        // and for download the pdf
        // await schoolReport.downloadReport("path/to/save.pdf", "id_of_the_report");


    } catch (error) {
        console.error("Error:", error);
    }
})();
