
const Client = require('isenjs');

// Create the client
const client = new Client("username", 
                          "password"
                         );
(async () => {
    try {

        await client.init();

        if (!client.logged_in) {
            console.error("Login failed");
            return;
        }

        const webAurion = await client.webAurion();

        // params: start_date : (str, optional) , end_date : (str, optional) 
        // format (Ex. "12-08-2023")
        // default : the current week
        const planning = await webAurion.planning();

        console.log(planning);
        //console.log(planning.toJSON()); // to have the Object


    } catch (error) {
        console.error("Error:", error);
    }
})();
