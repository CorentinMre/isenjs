const axios = require('axios');
const cheerio = require('cheerio');
const classification = require('./classification');

/**
 * Represents a connection to the webAurion portal.
 */
class WebAurion {
    /**
     * Creates a new instance of WebAurion.
     * @param {AxiosInstance} session - An Axios session for making HTTP requests.
     * @param {Array} cookies - An array of cookies to be used for requests.
     */
    constructor(session, cookies) {
        // Initialization of instance variables
        this.session = session;
        this.cookies = cookies;
        this.baseWebAurionUrl = "https://web.isen-ouest.fr/webAurion/?portail=false";
        this.baseMainPageUrl = "https://web.isen-ouest.fr/webAurion/faces/MainMenuPage.xhtml";
        this.id_leftMenu = {};
        this.classPlanning = {};
        this.classCity = {};
        this.classYear = {};
        this.classGroup = {};
        this.planningUrl = "https://web.isen-ouest.fr/webAurion/faces/Planning.xhtml";
        this.payloadForAbsences = "";
        this.payloadForGrades = "";
        this.payloadForPlanning = "";
        this.dataOtherPlanning = {
            "javax.faces.partial.ajax": "true",
            "javax.faces.source": "form:j_idt52",
            "javax.faces.partial.execute": "form:j_idt52",
            "javax.faces.partial.render": "form:sidebar",
            "form:j_idt52": "form:j_idt52"
        };
        this.payloadReport = {};
        this.infoReport = {};
    }

    /**
     * Initializes the WebAurion instance by fetching initial data from the portal.
     * @throws {Error} Throws an error if there's an issue during initialization.
     */
    async init() {
        const baseReq = await this.session.get(this.baseWebAurionUrl, {
            maxRedirects: 0,
                validateStatus: function () {
                    return true;
                }});
        this.updateCookies(baseReq.headers['set-cookie']);
        let url = baseReq.headers.location;
        let response;
        do {
            response = await this.session.get(url, { maxRedirects: 0,
                validateStatus: function () {
                    return true;
                } });


            if (response.headers['set-cookie']) this.updateCookies(response.headers['set-cookie']);

            if (response.status >= 300 && response.status < 400) {
                // new redirection
                url = response.headers.location;
            } else {
                break;
            }
        } while (response.status >= 300 && response.status < 400);

        if (response.status !== 200) {
            throw new Error(`WebAurion is not available for the moment: Error ${response.status}`);
        }
        this.payload = this.__getPayloadOfThePage(response.data);
        this.language = { "form:j_idt755_input": "275805" };  // Langue Francaise
        Object.assign(this.payload, this.language);
        const soup = cheerio.load(response.data);
        const leftMenu = soup("div.ui-slidemenu-content");
        leftMenu.find("li").each((index, element) => {
            this.id_leftMenu[soup(element).find("span.ui-menuitem-text").text()] = soup(element).attr("class").split("_").pop();
        });
        const result = soup("div.DispInline");
        result.each((index, element) => {
            const anchorText = soup(element).find("a").text();
            try {
                const payloadData = JSON.parse(soup(element).find("a").attr("onclick").split(",")[1].split(")")[0].replace(/'/g, '"'));
                if (anchorText === "Dernière note") {
                    this.payloadForGrades = payloadData;
                } else if (anchorText === "Absences à justifier") {
                    this.payloadForAbsences = payloadData;
                } else if (anchorText === "Planning") {
                    this.payloadForPlanning = payloadData;
                }
            } catch (error) {
                throw new Error(`Error while getting the payload for ${anchorText}`);
            }
        });
    }

    /**
     * Updates the Axios session with the current cookies.
     */
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
     * Performs a webAurion request using the specified URL and data.
     * @private
     * @param {string} url - The URL to make the request to.
     * @param {Object} data - The payload data for the request.
     * @returns {Promise<AxiosResponse>} The response from the request.
     */
    async __webAurion(url, data) {
        const mainPageUrl = this.baseMainPageUrl;
        Object.assign(data, this.payload);
        await this.session.post(mainPageUrl, data);
        return await this.session.get(url);
    }

    /**
     * Parses payload data from a web page.
     * @private
     * @param {string} text - The HTML text of the page.
     * @returns {Object} A dictionary containing the parsed payload.
     */
    __getPayloadOfThePage(text) {

      //  console.log("fazfa");
        const soup = cheerio.load(text);
        const inputPayload = soup("input");
        const payload = {};

        inputPayload.each((index, element) => {
            const name = soup(element).attr("name");
            const value = soup(element).attr("value") || "";
            payload[name] = value;
        });

       // console.log(payload);

        return payload;
    }

    /**
     * Retrieves the grades of the user from the webAurion portal.
     * @returns {Promise<GradeReport>} A GradeReport containing the user's grades.
     */
    async grades() {
        const gradeUrl = "https://web.isen-ouest.fr/webAurion/faces/LearnerNotationListPage.xhtml";
        const payload = this.payloadForGrades;
        const pageGrade = await this.__webAurion(gradeUrl, payload);
        const soup = cheerio.load(pageGrade.data);
        const result = soup("tr").slice(1);
        const grades = [];
        let gradeSum = 0;
        let gradeCount = 0;


        result.each((index, element) => {
            const tds = soup(element).find("td");
            const [date, code, name, grade, absence, appreciation, instructors] = tds.toArray().map(td => soup(td).text());

            if (grade !== "" && grade !== "-") {
                gradeSum += parseFloat(grade);
                gradeCount++;
            }

            const note = new classification.Grade(date, code, name, grade, absence, appreciation, instructors);
            grades.push(note);
        });

        const gradeAverage = gradeCount > 0 ? (gradeSum / gradeCount).toFixed(2) : 0;
        return new classification.GradeReport(gradeAverage, grades);
    }

    /**
     * Retrieves the absences of the user from the webAurion portal.
     * @returns {Promise<AbsenceReport>} An AbsenceReport containing the user's absences.
     */
    async absences() {
        const absencesUrl = "https://web.isen-ouest.fr/webAurion/faces/MesAbsences.xhtml";
        const payload = this.payloadForAbsences;
        const absencesPage = await this.__webAurion(absencesUrl, payload);
        const soup = cheerio.load(absencesPage.data);
        const checkAbsences = soup("tr").slice(6);
        const result = soup("tbody").eq(1).find("tr");
        const total = soup("tbody").eq(2).find("tr");

        if (checkAbsences.length === 1 && checkAbsences.eq(0).find("td").eq(0).text() === "Aucune absence.") {
            return new classification.AbsenceReport("0", "0", []);
        }

        const absencesInfo = {
            nbAbsences: total.eq(0).find("td").eq(1).text(),
            time: total.eq(1).find("td").eq(1).text(),
            absences: []
        };

        result.each((index, element) => {
            const tds = soup(element).find("td");
            absencesInfo.absences.push({
                date: tds.eq(0).text(),
                reason: tds.eq(1).text(),
                duration: tds.eq(2).text(),
                schedule: tds.eq(3).text(),
                course: tds.eq(4).text(),
                instructor: tds.eq(5).text(),
                subject: tds.eq(6).text()
            });
        });

        const data = absencesInfo.absences.map(a => new classification.Absence(
            a.date, a.reason, a.duration, a.schedule, a.course, a.instructor, a.subject
        ));

        return new classification.AbsenceReport(absencesInfo.nbAbsences, absencesInfo.time, data);
    }

    /**
     * Get the working time of the user
     * @param {object} req - The request object from the page
     * @param {string|null} start_date - The start date of the planning. Format: "dd-MM-yyyy". Default: null.
     * @param {string|null} end_date - The end date of the planning. Format: "dd-MM-yyyy". Default: null.
     * @param {boolean} isOtherPlanning - If the planning is for another user. Default: false.
     * @param {string} classe - The class of the planning. Default: "".
     * @returns {PlanningReport} - A report of the planning
     * @throws {Error} - If the planning is not found or there's an error
     */
    async __getWorkingTime(req, start_date = null, end_date = null, isOtherPlanning = false, classe = "") {
        try {
            // Extract the payload data from the request
            const payload = this.__getPayloadOfThePage(req.data);

            // Extract the date input from the payload
            const payloadDate = payload["form:date_input"];

            // Parse the payload date into a timestamp (seconds since epoch)
            const timestamp = Date.parse(payloadDate, 'dd/MM/yyyy') / 1000;

            // Calculate the end timestamp based on the end date (if provided) or add 6 days to the current date
            const endTimestamp = end_date ? (function () {
                // Parse the end date and adjust the format
                const parts = end_date.split('-');
                if (parts.length === 3) {
                    const day = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1; // Month is 0 to 11
                    const year = parseInt(parts[2], 10);
                    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                        const endDateObj = new Date(year, month, day);
                        return endDateObj.getTime() / 1000; // Convert to seconds
                    }
                }
                // If error, add 6 days to the current date
                return (timestamp + 518400);
            })() : (timestamp + 518400);

            // Calculate the start timestamp based on the start date (if provided) or use the current date
            const startTimestamp = start_date ? (function () {
                // Parse the start date and adjust the format
                const parts = start_date.split('-');
                if (parts.length === 3) {
                    const day = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1; // Month is 0 to 11
                    const year = parseInt(parts[2], 10);
                    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                        const startDateObj = new Date(year, month, day);
                        return startDateObj.getTime() / 1000; // Convert to seconds
                    }
                }
                // If error, return the current date
                return timestamp;
            })() : timestamp;

            // Find the appropriate form ID from the payload
            const idform = Object.keys(payload).find(key => payload[key] === "agendaWeek")?.slice(0, -5);

            // Construct the data payload for the request
            const data = {
                "javax.faces.partial.ajax": "true",
                "javax.faces.source": idform,
                "javax.faces.partial.execute": idform,
                "javax.faces.partial.render": idform,
                [idform]: idform,
                [idform + "_start"]: startTimestamp * 1000, // Convert to milliseconds
                [idform + "_end"]: endTimestamp * 1000, // Convert to milliseconds
                "form:offsetFuseauNavigateur": "-7200000",
            };
            // Merge the payload data with additional data and language
            Object.assign(payload, data, this.language);

            // Define the planning URL
            const planningUrl = this.planningUrl;

            // Perform the request to get the planning
            const response = await this.session.post(planningUrl, payload, {
                maxRedirects: 0,
                validateStatus: function () {
                    return true;
                }
            });

            // Load the response data using Cheerio
            const soup = cheerio.load(response.data, { xmlMode: true });

            // Extract the planning information from the response
            const planning = soup(`update[id="${idform}"]`).text();
            let parsedPlanning;
            try {
                parsedPlanning = JSON.parse(planning);
            } catch (error) {
                throw new Error("Error while parsing the planning");
            }

            // Process the parsed planning events
            const workingTime = parsedPlanning.events.map(event => {
                const info = event.title.split(" - ");
                const event_data = {
                    "id": event.id,
                    "start": event.start,
                    "end": event.end,
                    "class_name": event.className,
                    "type": info[2],
                    "subject": (event.className !== "DS") ? info[3] : info.slice(4, -3).join(", "),
                    "description": (event.className !== "DS") ? info.slice(4, -2).join(", ") : info.slice(4, -3).join(", "),
                    "instructors": info[info.length - 2],
                };

                // Adjust event_data based on whether it's for another planning or not
                if (isOtherPlanning) {
                    event_data["start_time"] = info[0];
                    event_data["end_time"] = info[1];
                    event_data["room"] = info[info.length - 1];
                    event_data["class_info"] = classe;
                } else {
                    event_data["start_time"] = info[0].split(" à ")[0];
                    event_data["end_time"] = info[0].split(" à ")[1];
                    event_data["room"] = info[1];
                    event_data["class_info"] = info[info.length - 1];
                }

                // Create an instance of the Event class using the event_data
                return new classification.Event(...Object.values(event_data));
            });

            // Create and return a PlanningReport with the workingTime
            return new classification.PlanningReport(workingTime);
        } catch (error) {
            // Propagate the error
            throw error;
        }
    }

    /**
     * Get the user's planning
     * @param {string|null} start_date - The start date of the planning. Format: "dd-MM-yyyy". Default: null.
     * @param {string|null} end_date - The end date of the planning. Format: "dd-MM-yyyy". Default: null.
     * @returns {PlanningReport} - A report of the user's planning
     * @throws {Error} - If there's an error
     */
    async planning(start_date = null, end_date = null) {
        try {
            // Request the page to get the payload
            const pagePlanning = await this.__webAurion(this.planningUrl, this.payloadForPlanning);

            // Get the working time based on the provided start and end dates
            return this.__getWorkingTime(pagePlanning, start_date, end_date);
        } catch (error) {
            // Propagate the error
            throw error;
        }
    }
}

module.exports = WebAurion;