
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

        const absences = await webAurion.absences();
        console.log(absences);
        // console.log(absences.toJSON()); // to have the Object


    } catch (error) {
        console.error("Error:", error);
    }
})();
