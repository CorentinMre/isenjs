const axios = require("axios");
const cheerio = require("cheerio");
const base64url = require('base64url');
const { ClassMember, ClassMemberReport } = require("./classification.js");
const WebAurion = require("./dataClasses.js");

class Client {
    constructor(username = "", password = "") {
        this.username = username;
        this.password = password;

        this.cookies = [];
        this.session = axios.create({
            withCredentials: true,
            headers: {
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:103.0) Gecko/20100101 Firefox/103.0",
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie" : this.cookies.join("; "),
            },
        });

        this.logged_in;// = this.__login();
    }

    capitalizeFirstLetter(str) {
        str = str.toLowerCase();
        return str.replace(/^\w/, (c) => c.toUpperCase());
    }
    
    async init() {
        // Perform the login operation here
        try {
          this.logged_in = await this.__login();
        //   if (!this.logged_in) {
        //     //throw new Error("Login failed");
        //     console.error("Login failed");
        //   }
        } catch (error) {
          console.error("Error during login:", error);
          throw error;
        }
      }

    async __checkClassExist(cycle, annee, ville) {
        /*
        Check if the class exists
        */

        const cycles = ["CIR", "CBIO", "CENT", "CEST", "CBIAST", "CSI"];
        const annees = ["1", "2", "3"];
        const villes = ["Caen", "Brest", "Nantes", "Rennes"];

        if (!cycles.includes(cycle.toUpperCase())) {
            throw new Error("Vous devez renseigner un cycle de la liste suivante: " + cycles.join(", "));
        }
        if (!annees.includes(annee)) {
            throw new Error("Vous devez renseigner une année de la liste suivante: " + annees.join(", "));
        }
        if (!villes.includes(ville)) {
            throw new Error("Vous devez renseigner une ville de la liste suivante: " + villes.join(", "));
        }

        return true;
    }

    updateSession() {
        this.session = axios.create({
            withCredentials: true,
            headers: {
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:103.0) Gecko/20100101 Firefox/103.0",
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie" : this.cookies.join("; "),
            },
        });
    }

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

    async __login() {

        try{
            let reqDefaultUrl = "https://auth.isen-ouest.fr/cas/login?service=https://web.isen-ouest.fr/uPortal/Login";

            let loginPage = await this.session.get(reqDefaultUrl);

            const $ = cheerio.load(loginPage.data);
            const exec_value = $('input[name="execution"]').val();

            const payload = {
                "username": this.username,
                "password": this.password,
                "execution": exec_value,
                "_eventId": "submit",
                "geolocation": "",
            };

            let response = await this.session.post(reqDefaultUrl, payload, {
                maxRedirects: 0,
                validateStatus: function () {
                    return true;
                }});

            this.updateCookies(response.headers['set-cookie']);
            
            let url = response.headers.location;

            do {
                response = await this.session.get(url, { maxRedirects: 0,
                    validateStatus: function () {
                        return true;
                    } });


                this.updateCookies(response.headers['set-cookie']);

                if (response.status >= 300 && response.status < 400) {
                    // new redirection
                    url = response.headers.location;
                } else {
                    break;
                }
            } while (response.status >= 300 && response.status < 400);

            return response.status === 200;
        }
        catch (error) {
            //console.error("An error occurred:", error);
            return false;
        }
    }

    logout() {
        /*
        Logout from the session
        */

        // Disconnect from the session (not really necessary)
        this.session.get(
            "https://auth.isen-ouest.fr/cas/logout?url=https://web.isen-ouest.fr/uPortal/Login"
        );
    }

    async classMember(cycle, annee, ville) {
        try {
            // Base URL of trombinoscope
            const baseUrl = "https://web.isen-ouest.fr/trombino";

            // Set payload for the request
            const payload = {
                "nombre_colonnes": 5,
                "choix_groupe": `${cycle.toUpperCase()}${annee} ${this.capitalizeFirstLetter(ville)} 2023-2024`,
                "statut": "etudiant",
            };

            // Check if the class exists
            await this.__checkClassExist(cycle.toUpperCase(), annee, this.capitalizeFirstLetter(ville));

            // Get the class trombi cookie
            const req1 = await this.session.get(baseUrl + "/", {
                maxRedirects: 0,
                validateStatus: function () {
                    return true;
                }
                    });
            
           // console.log(req1.headers['set-cookie'][0]);
            this.updateCookies(req1.headers['set-cookie'][0]);


          //  console.log(this.cookies);


            const req = await this.session.post(`${baseUrl}/fonctions/ajax/lister_etudiants.php`, payload,{
                maxRedirects: 0,
                validateStatus: function () {
                    return true;
                }
            });

          //  console.log(req.data);

            const $ = cheerio.load(req.data);
            const eleves = $("td#tdTrombi");
            
            // Create the list of ClassMember objects
            let result = new ClassMemberReport({ nbMembers: eleves.length, data: [] });

            eleves.each((index, eleve) => {
                let name = $(eleve).find("b").text();
                let mail = $(eleve).find("a").text();
                let avatar_url = (baseUrl + $(eleve).find("img").attr("src")).replace(" .", "/");
                let class_member = new ClassMember( name, mail, avatar_url );
                result.data.push(class_member);
            });

            // Return the ClassMemberReport object
            return result;
        } catch (error) {
            console.error("Error in classMember:", error);
            throw error;
        }
    }

    async userInfo() {
        try {
          // Get the user info
          const req = await this.session.get("https://web.isen-ouest.fr/uPortal/api/v5-1/userinfo", );
    
          // Scrap the user info
          const info = JSON.parse(base64url.decode(req.data.split(".")[1]));
    
          // Return the user info
          return info;
        } catch (error) {
          console.error("Error fetching user info:", error);
          throw error;
        }
      }

    async webAurion() {
        /**
         * Return the webAurion class, For check grades, absences, planning, etc...
         */
        // Obtenir les informations de webAurion à partir du fichier "dataClasses.js"
        const webAurion = new WebAurion(this.session, this.cookies);
        await webAurion.init();

        // Retournez l'instance de WebAurion initialisée.
        return webAurion;
    }
}

module.exports = Client;