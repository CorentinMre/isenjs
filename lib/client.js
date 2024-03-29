const axios = require("axios");
const cheerio = require("cheerio");
const { ClassMember, ClassMemberReport } = require("./classification.js");
const { WebAurion, Moodle } = require("./dataClasses.js");

/**
 * Represents a client for interacting with the ISEN-ouest web services.
 */
class Client {
  /**
   * Creates a new instance of the Client class.
   * @param {string} username - The username for the ISEN-ouest.
   * @param {string} password - The password for the ISEN-ouest.
   */
  constructor(username = "", password = "") {
    // Initialize instance variables
    this.username = username;
    this.password = password;

    this.cookies = [];
    this.session = axios.create({
      withCredentials: true,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64; rv:103.0) Gecko/20100101 Firefox/103.0",
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: this.cookies.join("; "),
      },
    });


    this.logged_in = false;
    if (this.username != "" && this.password != "") {
      this.initializeClient(username, password);
    }
    this.annee = "2023-2024";
  }

  async initializeClient(username, password) {
    try {
      this.logged_in = this.__login(username, password);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Capitalizes the first letter of a string.
   * @param {string} str - The input string.
   * @returns {string} The input string with the first letter capitalized.
   */
  capitalizeFirstLetter(str) {
    str = str.toLowerCase();
    return str.replace(/^\w/, (c) => c.toUpperCase());
  }

  // /**
  //  * Initializes the client by performing the login operation.
  //  * @throws {Error} Throws an error if the login fails.
  //  */
  // async init() {
  //     // Perform the login operation here
  //     try {
  //       this.logged_in = this.__login();
  //     } catch (error) {
  //       console.error("Error during login:", error);
  //       throw error;
  //     }
  // }

  /**
   * Checks if the specified class exists based on cycle, year, and city.
   * @private
   * @param {string} cycle - The cycle of the class.
   * @param {string} annee - The year of the class.
   * @param {string} ville - The city of the class.
   * @returns {boolean} True if the class exists; otherwise, false.
   * @throws {Error} Throws an error if the provided cycle, year, or city is not valid.
   */
  __checkClassExist(cycle, annee, ville) {
    /*
        Check if the class exists
        */

    const cycles = ["CIR", "CBIO", "CENT", "CEST", "CBIAST", "CSI", "CIPA"];
    const annees = ["1", "2", "3", "4", "5"];
    const villes = ["Caen", "Brest", "Nantes", "Rennes"];

    if (!cycles.includes(cycle.toUpperCase())) {
      throw new Error(
        "Vous devez renseigner un cycle de la liste suivante: " +
          cycles.join(", ")
      );
    }
    if (!annees.includes(annee)) {
      throw new Error(
        "Vous devez renseigner une année de la liste suivante: " +
          annees.join(", ")
      );
    }
    if (!villes.includes(ville)) {
      throw new Error(
        "Vous devez renseigner une ville de la liste suivante: " +
          villes.join(", ")
      );
    }

    return true;
  }

  /**
   * Updates the Axios session with the current cookies.
   */
  updateSession() {
    this.session = axios.create({
      withCredentials: true,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64; rv:103.0) Gecko/20100101 Firefox/103.0",
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: this.cookies.join("; "),
      },
    });
  }

  /**
   * Updates the cookies with new cookies and updates the session accordingly.
   * @param {Array} newCookie - An array of new cookies.
   */
  updateCookies(newCookie) {
    for (let i = 0; i < newCookie.length; i++) {
      let cookie = newCookie[i];
      let cookieName = cookie.split("=")[0];
      let cookieExist = false;
      for (let j = 0; j < this.cookies.length; j++) {
        if (this.cookies[j].startsWith(cookieName)) {
          this.cookies[j] = cookie;
          cookieExist = true;
        }
      }
      if (!cookieExist) {
        this.cookies.push(cookie);
      }
    }
    this.updateSession();
  }


  

  /**
   * Performs the login operation for the client.
   * @private
   * @returns {boolean} True if the login was successful; otherwise, false.
   */

  async __login(username, password) {
    try {
      let reqDefaultUrl = "https://auth.isen-ouest.fr/cas/login";

      let loginPage = await this.session.get(reqDefaultUrl);

      const $ = cheerio.load(loginPage.data);
      const exec_value = $('input[name="execution"]').val();

      const payload = {
        username: username,
        password: password,
        execution: exec_value,
        _eventId: "submit",
        geolocation: "",
      };

      let response = await this.session.post(reqDefaultUrl, payload);
      this.updateCookies(response.headers["set-cookie"]);

      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Logs out from the session.
   */
  logout() {
    // Disconnect from the session (not really necessary)
    this.session.get("https://auth.isen-ouest.fr/cas/logout");
  }


  /**
   * Retrieves user information from the ISEN-ouest portal.
   * @returns {Promise<Object>} An object containing user information.
   * @throws {Error} Throws an error if there's an issue fetching user information.
   */
  async userInfo() {
    try {
      // Get the user info
      const req = await this.session.get(
        "https://auth.isen-ouest.fr/cas/login"
      );

      const $ = cheerio.load(req.data);
      const tbody = $("tbody");
      const tr = tbody.find("tr");

      let userInfos = {};

      tr.each((index, element) => {
        let td = $(element).find("td");
        let key = $(td[0]).text().trim().toLowerCase();
        let value = $(td[1]).text().trim().slice(1, -1);
        userInfos[key] = value;
      });

      return userInfos;
    } catch (error) {
      console.error("Error fetching user info:", error);
      throw error;
    }

    // throw new Error("go to the userInfo of WebAurion");
  }

  /**
   * Returns an instance of the WebAurion class for accessing grades, absences, planning, etc.
   * @returns {Promise<WebAurion>} An instance of the WebAurion class.
   */
  async webAurion() {
    // Get informations from dataClasses.js
    const webAurion = new WebAurion(this.session, this.cookies);
    await webAurion.init(this.username, this.password);

    // Return the WebAurion object
    return webAurion;
  }

  // /**
  //  * Returns an instance of the Moodle class for accessing grades, absences, planning, etc.
  //  * @returns {Promise<Moodle>} An instance of the Moodle class.
  //  */
  // async moodle() {
  //   // Get informations from dataClasses.js
  //   const moodle = new Moodle(this.session, this.cookies);
  //   await moodle.init();

  //   // Return the WebAurion object
  //   return moodle;
  // }
}

module.exports = {
  Client,
  WebAurion,
  Moodle,
}
