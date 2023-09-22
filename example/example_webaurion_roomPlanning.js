
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

        // params: city: str, start_date : (str, optional) , end_date : (str, optional) 
        // format (Ex. "12-08-2023")
        // default : the current week
        const roomPlanning = await webAurion.roomPlanning("Caen", "16-08-2023", "16-05-2024");

        console.log(roomPlanning);
        //console.log(roomPlanning.toJSON()); // to have the Object


    } catch (error) {
        console.error("Error:", error);
    }
})();
