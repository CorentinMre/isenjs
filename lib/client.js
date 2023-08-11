const axios = require("axios");
const cheerio = require("cheerio");
const { ClassMember, ClassMemberReport } = require("./classification.js");

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

        this.logged_in = this.__login();
    }

    capitalizeFirstLetter(str) {
        return str.replace(/^\w/, (c) => c.toUpperCase());
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

    updateCookies(newCookie) {
        this.cookies.push(newCookie);
       // console.log(this.cookies);
        this.session = axios.create({
            withCredentials: true,
            headers: {
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:103.0) Gecko/20100101 Firefox/103.0",
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie" : this.cookies.join("; "),
            },
        });
    }

    async __login() {
        try{
            let loginPage = await this.session.get('https://auth.isen-ouest.fr/cas/login?service=https://web.isen-ouest.fr/uPortal/Login');

            const $ = cheerio.load(loginPage.data);
            const exec_value = $('input[name="execution"]').val();

            const payload = {
                "username": this.username,
                "password": this.password,
                "execution": exec_value,
                "_eventId": "submit",
                "geolocation": "",
            };

            let response = await this.session.post('https://auth.isen-ouest.fr/cas/login?service=https://web.isen-ouest.fr/uPortal/Login', payload, {
                maxRedirects: 0,
                validateStatus: function () {
                    return true; // Accept only if the status is in the 2xx range
                }});

            this.updateCookies(response.headers['set-cookie'][0]);

            let response2 = await this.session.get(response.headers['location'], {
                maxRedirects: 0,
                validateStatus: function () {
                    return true; // Accept only if the status is in the 2xx range
                    },
                });

            this.updateCookies(response2.headers['set-cookie'][0]);

            let response3 = await this.session.get(response2.headers['location'], {
                maxRedirects: 0,
                validateStatus: function () {
                    return true; // Accept only if the status is in the 2xx range
                    },
                });

            this.updateCookies(response3.headers['set-cookie'][0]);

            let response4 = await this.session.get(response3.headers['location'], {
                maxRedirects: 0,
                validateStatus: function () {
                    return true; // Accept only if the status is in the 2xx range
                    },
                });


            // suprimer les 2 derniers cookies
            this.cookies.pop();
            this.cookies.pop();
            
            for (let i = 0; i < response4.headers['set-cookie'].length; i++) {
                this.updateCookies(response4.headers['set-cookie'][i]);
            }

           // console.log(this.cookies);

            return response4.status === 200;
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
                    return true; // Accept only if the status is in the 2xx range
                }
                    });
            
           // console.log(req1.headers['set-cookie'][0]);
            this.updateCookies(req1.headers['set-cookie'][0]);


          //  console.log(this.cookies);


            const req = await this.session.post(`${baseUrl}/fonctions/ajax/lister_etudiants.php`, payload,{
                maxRedirects: 0,
                validateStatus: function () {
                    return true; // Accept only if the status is in the 2xx range
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

}

module.exports = Client;