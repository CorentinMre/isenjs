
const Client = require('isenjs');


// Create the client
const client = new Client("<username>", 
                          "<password>"
                         );

(async () => {
    try {

        const logged_in = await client.logged_in; // don't this line for login the user
        if (!logged_in) {
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
