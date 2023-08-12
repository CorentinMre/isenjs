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
        const soup = cheerio.load(text);
        const inputPayload = soup("input");
        const payload = {};

        inputPayload.each((index, element) => {
            const name = soup(element).attr("name");
            const value = soup(element).attr("value") || "";
            payload[name] = value;
        });

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
}

module.exports = WebAurion;