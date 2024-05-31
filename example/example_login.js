const { WebAurion } = require("isenjs");

// Create the client
const client = new Client();

(async () => {
  try {
  
    await client.login("<username>", "<password>");

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
