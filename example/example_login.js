
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

        // Get User Info
        const userInfo = await client.userInfo();
        console.log("User Info:", userInfo);

    } catch (error) {
        console.error("Error:", error);
    }
})();
