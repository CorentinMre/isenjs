const axios = require("axios");
const cheerio = require("cheerio");
const classification = require("./classification");
const fs = require("fs");

/**
 * Represents a connection to the webAurion portal.
 */
class WebAurion {
  /**
   * Creates a new instance of WebAurion.
   * @param {AxiosInstance} session - An Axios session for making HTTP requests.
   * @param {Array} cookies - An array of cookies to be used for requests.
   */
  constructor(
    username = null,
    password = null,
    session = null,
    cookies = null
  ) {
    // Initialization of instance variables
    this.cookies = cookies || [];
    this.session =
      session ||
      axios.create({
        withCredentials: true,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64; rv:103.0) Gecko/20100101 Firefox/103.0",
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: this.cookies.join("; "),
        },
      });
    this.session_planning = null;

    this.loginUrl = "https://web.isen-ouest.fr/webAurion/faces/Login.xhtml";
    this.baseWebAurionUrl =
      "https://web.isen-ouest.fr/webAurion/?portail=false";
    this.baseMainPageUrl =
      "https://web.isen-ouest.fr/webAurion/faces/MainMenuPage.xhtml";
    this.id_leftMenu = {};
    this.classPlanning = {};
    this.classCity = {};
    this.classYear = {};
    this.classGroup = {};
    this.planningUrl =
      "https://web.isen-ouest.fr/webAurion/faces/Planning.xhtml";
    this.payloadForAbsences = "";
    this.payloadForGrades = "";
    this.payloadForPlanning = "";
    this.dataOtherPlanning = {
      "javax.faces.partial.ajax": "true",
      "javax.faces.source": "form:j_idt52",
      "javax.faces.partial.execute": "form:j_idt52",
      "javax.faces.partial.render": "form:sidebar",
      "form:j_idt52": "form:j_idt52",
    };
    this.payloadReport = {};
    this.infoReport = {};
    this.name = "";
    this.last_connection; // = new Date();
    this.annee = this.getActualScholarPeriod();
    this.gradeData = null;
    this.absenceData = null;
    this.planningData = null;
    this.loginUrl = "https://web.isen-ouest.fr/webAurion/login";
    this.baseUrl = "https://web.isen-ouest.fr/webAurion/faces/Login.xhtml";
    this.url = "https://web.isen-ouest.fr/webAurion/?portail=false";

    if (username !== null && password !== null) {
      this.logged_in = false;
      this.initializeClient(username, password);
    }
  }

  async initializeClient(username, password) {
    try {
      this.logged_in = this.init(username, password);
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

  /**
   * Get the current scholar year
   */
  getActualScholarPeriod() {
    const today = new Date();
    let year = today.getFullYear();

    // Si on est avant septembre, on est encore dans l'année scolaire de l'année précédente
    if (today.getMonth() < 8) {
      year = year - 1;
    }

    return `${year}-${year + 1}`;
  }

  /**
   * Initializes the WebAurion instance by fetching initial data from the portal.
   * @throws {Error} Throws an error if there's an issue during initialization.
   */
  async init(username, password) {
    // console.log(username, password);
    try {
      let response = await this.session.get(this.loginUrl);
      this.updateCookies(response.headers["set-cookie"]);

      const payload = {
        username: username,
        password: password,
        j_idt27: "",
      };

      const payload2 = {
        username: username,
        password: password,
        credentialId: "",
      };

      response = await this.session.post(this.loginUrl, payload);
      this.updateCookies(response.headers["set-cookie"]);

      let newUrl = this.getUrlForLoginPost(response.data);
      this.updateCookies(response.headers["set-cookie"]);

      response = await this.session.post(newUrl, payload2, {
        maxRedirects: 0,
        validateStatus: function () {
          return true;
        },
      });
      this.updateCookies(response.headers["set-cookie"]);
      newUrl = response.headers.location;

      response = await this.session.get(newUrl, {
        maxRedirects: 0,
        validateStatus: function () {
          return true;
        },
      });
      this.updateCookies(response.headers["set-cookie"]);

      // response = await this.session.get(this.url);
    } catch (error) {
      // console.error("Error during login:", error);
      // throw error;
      // console.log("Error pour", username);
      return false;
    }

    const response = await this.session.get(this.baseWebAurionUrl);

    // console.log(response.data);

    if (response.status !== 200) {
      throw new Error(
        `WebAurion is not available for the moment: Error ${response.status}`
      );
    }

    // console.log(response.data);
    this.payload = this.__getPayloadOfThePage(response.data);
    this.language = { "form:j_idt755_input": "275805" }; // Langue Francaise
    Object.assign(this.payload, this.language);
    const soup = cheerio.load(response.data);
    this.name = soup("div.menuMonCompte").find("h3").text();
    const leftMenu = soup("div.ui-slidemenu-content");
    leftMenu.find("li").each((index, element) => {
      this.id_leftMenu[
        soup(element).find("span.ui-menuitem-text").first().text()
      ] = soup(element).attr("class").split(" ").slice(-2)[0].split("_")[1];
    });
    const result = soup("div.DispInline");
    result.each((index, element) => {
      const anchorText = soup(element).find("a").text();
      try {
        const payloadData = JSON.parse(
          soup(element)
            .find("a")
            .attr("onclick")
            .split(",")[1]
            .split(")")[0]
            .replace(/'/g, '"')
        );
        if (anchorText === "Dernière note") {
          this.payloadForGrades = payloadData;
        } else if (anchorText === "Absences à justifier") {
          this.payloadForAbsences = payloadData;
        } else if (anchorText === "Planning") {
          this.payloadForPlanning = payloadData;
        }
      } catch (error) {
        //throw new Error(`Error while getting the payload for ${anchorText}`);
        // console.log(`Error while getting the payload for ${anchorText}`);
        // return false;
      }
    });
    Object.assign(this.dataOtherPlanning, this.payload);
    this.last_connection = new Date();
    this.session_planning = this.session;
    Object.assign(this.payloadForGrades, this.payload);
    this.gradeData = new WebAurionGrades(
      this,
      this.session,
      this.payloadForGrades
    );
    Object.assign(this.payloadForAbsences, this.payload);
    this.absenceData = new WebAurionAbsences(
      this,
      this.session,
      this.payloadForAbsences
    );
    Object.assign(this.payloadForPlanning, this.payload);
    this.planningData = new WebAurionPlanning(
      this,
      this.session,
      this.payloadForPlanning
    );

    // console.log(this.session);

    return true;
  }

  getUrlForLoginPost(data) {
    const $ = cheerio.load(data);
    const form = $("form");
    const action = form.attr("action");
    return action;
  }

  /**
   * Removes accents from a string.
   */
  removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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
   * Performs a webAurion request using the specified URL and data.
   * @private
   * @param {string} url - The URL to make the request to.
   * @param {Object} data - The payload data for the request.
   * @returns {Promise<AxiosResponse>} The response from the request.
   */
  async __webAurion(url, data, session = this.session) {
    const mainPageUrl = this.baseMainPageUrl;
    Object.assign(data, this.payload);
    await session.post(mainPageUrl, data);
    this.last_connection = new Date();
    return await session.get(url);
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
   * Get the grades of the user
   * @returns {Promise<Grade>} - A report of the grades
   * @throws {Error} - If there's an error
   */
  async grades() {
    return await this.gradeData.getGrades();
  }

  /**
   * Get the absences of the user
   * @returns {Promise<Absence>} - A report of the absences
   * @throws {Error} - If there's an error
   */
  async absences() {
    return await this.absenceData.getAbsences();
  }

  async event(id) {
    return await this.planningData.getEvent(id);
  }

  /**
   * Get the user's planning
   * @param {string|null} start_date - The start date of the planning. Format: "dd-MM-yyyy". Default: null.
   * @param {string|null} end_date - The end date of the planning. Format: "dd-MM-yyyy". Default: null.
   * @returns {PlanningReport} - A report of the user's planning
   * @throws {Error} - If there's an error
   */
  async planning(start_date = null, end_date = null) {
    return await this.planningData.getPlanning(start_date, end_date);
  }

  /**
   * Get the working time of the user
   * @param {object} req - The request object from the page
   * @param {string|null} start_date - The start date of the planning. Format: "dd-MM-yyyy". Default: null.
   * @param {string|null} end_date - The end date of the planning. Format: "dd-MM-yyyy". Default: null.
   * @param {boolean} isOtherPlanning - If the planning is for another user. Default: false.
   * @param {string} infoSalles - The information of the room. Default: null.
   * @returns {PlanningReport} - A report of the planning
   * @throws {Error} - If the planning is not found or there's an error
   */
  async __getWorkingTime(
    req,
    start_date = null,
    end_date = null,
    isOtherPlanning = false,
    infoSalles = null,
    session = this.session
  ) {
    try {
      // Extract the payload data from the request
      const payload = this.__getPayloadOfThePage(req.data);

      // Extract the date input from the payload
      const payloadDate = payload["form:date_input"];

      // Parse the payload date into a timestamp (seconds since epoch)
      const timestamp = Date.parse(payloadDate, "dd/MM/yyyy") / 1000;

      // Calculate the end timestamp based on the end date (if provided) or add 6 days to the current date
      const endTimestamp = end_date
        ? (function () {
            // Parse the end date and adjust the format
            const parts = end_date.split("-");
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
            return timestamp + 518400;
          })()
        : timestamp + 518400;

      // Calculate the start timestamp based on the start date (if provided) or use the current date
      const startTimestamp = start_date
        ? (function () {
            // Parse the start date and adjust the format
            const parts = start_date.split("-");
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
          })()
        : timestamp;

      // Find the appropriate form ID from the payload
      const idform = Object.keys(payload)
        .find((key) => payload[key] === "agendaWeek")
        ?.slice(0, -5);

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
      const response = await session.post(planningUrl, payload, {
        maxRedirects: 0,
        validateStatus: function () {
          return true;
        },
      });

      // Load the response data using Cheerio
      const soup = cheerio.load(response.data, { xmlMode: true });

      // Extract the planning information from the response
      const planning = soup(`update[id="${idform}"]`).text();
      let parsedPlanning;
      try {
        parsedPlanning = JSON.parse(planning);
      } catch (error) {
        return new classification.PlanningReport([]);
        //throw new Error("Error while parsing the planning");
      }

      // Process the parsed planning events
      const workingTime = parsedPlanning.events.map((event) => {
        const info = event.title.split(" - ");
        const event_data = {
          id: event.id,
          start: event.start,
          end: event.end,
          class_name: event.className,
          type: info[2],
          subject:
            event.className !== "DS" ? info[3] : info.slice(4, -3).join(", "),
          description:
            event.className !== "DS"
              ? info.slice(4, -2).join(", ")
              : info.slice(4, -3).join(", "),
          instructors: info[info.length - 2],
        };

        // Adjust event_data based on whether it's for another planning or not
        if (isOtherPlanning) {
          event_data["start_time"] = info[0];
          event_data["end_time"] = info[1];
          event_data["room"] = info[info.length - 1];
          // event_data["class_info"] = classe;
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
      return new classification.PlanningReport(workingTime, infoSalles);
    } catch (error) {
      // Propagate the error
      throw error;
    }
  }

  async __soupForPlanning(data, id) {
    const url = this.baseMainPageUrl;
    data["webscolaapp.Sidebar.ID_SUBMENU"] = "submenu_" + id;

    try {
      const response = await this.session.post(url, data);
      const soup = cheerio.load(response.data, { xmlMode: true });
      const inf = soup(`update[id="form:sidebar"]`).text();

      return cheerio.load(inf);
    } catch (error) {
      throw error;
    }
  }

  async getSchoolReport() {
    try {
      const urlPost = this.baseMainPageUrl;

      const information = "Scolarité";
      const id_information = this.id_leftMenu[information];
      const soup1 = await this.__soupForPlanning(
        this.dataOtherPlanning,
        id_information
      );
      const id_info = {};
      const listOfInformation = soup1("li.enfants-entierement-charges li");
      listOfInformation.each((index, child) => {
        const spanText = soup1(child).find("span.ui-menuitem-text").text();
        id_info[spanText] = soup1(child).attr("class").split("_").pop();
      });

      const information2 = "Mes documents";
      const id_information2 = id_info[information2];
      const soup2 = await this.__soupForPlanning(
        this.dataOtherPlanning,
        id_information2
      );

      const id_info2 = {};
      const listOfInformation2 = soup2("li.enfants-entierement-charges li");
      listOfInformation2.each((index, child) => {
        const spanText = soup2(child).find("span.ui-menuitem-text").text();
        id_info2[spanText] = soup2(child)
          .find("a.ui-menuitem-link")
          .attr("class")
          .split("_")
          .pop();
      });

      const payload = {
        "form:sidebar": "form:sidebar",
        "form:sidebar_menuid": "1_0_1",
        "form:j_idt780:j_idt782_dropdown": "1",
        "form:j_idt780:j_idt782_mobiledropdown": "1",
      };

      const req1 = await this.session.post(urlPost, payload);

      if (req1.status !== 200) {
        throw new Error(
          `WebAurion is not available at the moment: Error ${req1.status}, 1`
        );
      }

      const payload2 = this.__getPayloadOfThePage(req1.data);
      Object.assign(payload2, payload, this.language);

      const req2 = await this.session.post(urlPost, payload2);

      if (req2.status !== 200) {
        throw new Error(
          `WebAurion is not available at the moment: Error ${req2.status}, 2`
        );
      }

      this.payloadReport = this.__getPayloadOfThePage(req2.data);

      const $ = cheerio.load(req2.data);
      const report = $("div.ui-datatable-tablewrapper select option");

      const result = { nbReports: report.length, data: [] };

      report.each((index, element) => {
        const nameFile = $(element).text().split(".pdf")[0].trim() + ".pdf";
        const report_data = {
          name: nameFile,
          id: $(element).attr("value"),
        };
        result["data"].push(report_data);
      });

      const schoolReport = new classification.SchoolReport(
        result.nbReports,
        result.data
      );
      this.infoReport = schoolReport;

      return schoolReport;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Download the report of the user.
   * @param {string} [path=null] - Path of the report (defaults to the name in WebAurion).
   * @param {string} [idReport=null] - ID of the report (defaults to all the reports of the user).
   * @returns {Promise<void>} A Promise indicating the completion of the download.
   * @throws {Error} Throws an error if there's an issue during download.
   */
  async downloadReport(path = null, idReport = null) {
    try {
      if (Object.keys(this.payloadReport).length === 0) {
        this.infoReport = await this.getSchoolReport();
      }

      if (this.infoReport.nbReports === 0) {
        throw new Error("The user does not have any report");
      }

      if (this.infoReport.nbReports > 1 && path === null && idReport === null) {
        for (const report of this.infoReport.data) {
          await this.downloadReport(report.name, report.id);
        }
        return;
      }

      if (path === null && idReport !== null) {
        for (const i of this.infoReport.data) {
          if (i.id === idReport) {
            path = i.name;
            break;
          }
        }
        if (path === null) {
          throw new Error("The report is not found");
        }
      }

      if (idReport === null) {
        for (const i of this.infoReport.data) {
          if (path === null) {
            path = i.name;
          }
          await this.downloadReport(i.name, i.id);
          return;
        }
      }

      const urlChoixDonnee =
        "https://web.isen-ouest.fr/webAurion/faces/ChoixDonnee.xhtml";

      const payload = {
        "form:j_idt193:0:j_idt209": "form:j_idt193:0:j_idt209",
        "form:j_idt193:0:documents_input": idReport,
      };

      Object.assign(payload, this.payloadReport);

      const req = await this.session.post(urlChoixDonnee, payload, {
        responseType: "arraybuffer",
      });

      if (req.status !== 200) {
        throw new Error(
          `WebAurion is not available at the moment: Error ${req.status}`
        );
      }

      if (!path.endsWith(".pdf")) {
        path += ".pdf";
      }

      fs.writeFileSync(path, req.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @returns {Promise<string>} The class of the user
   */
  async getMyClass() {
    const urlPost = this.baseMainPageUrl;

    const information = "Scolarité";
    const id_information = this.id_leftMenu[information];
    this.__soupForPlanning(this.dataOtherPlanning, id_information);

    const payload = {
      "form:sidebar": "form:sidebar",
      "form:sidebar_menuid": "1_7",
      "form:j_idt780:j_idt782_dropdown": "1",
      "form:j_idt780:j_idt782_mobiledropdown": "1",
    };

    let req = await this.session.post(urlPost, payload);

    const payload2 = this.__getPayloadOfThePage(req.data);

    Object.assign(payload2, payload);
    Object.assign(payload2, this.language);

    req = await this.session.post(urlPost, payload2);

    const $ = cheerio.load(req.data);

    const row = $("tr.CursorInitial").eq(0);
    const classe = row.find("td").eq(0).text();

    return classe;
  }

  /**
   * @param {string} cycle The cycle of the planning
   * @param {string} year The year of the planning student
   * @param {string} city The city of the planning
   * @param {string} start_date Start date of the planning. Format: "dd-MM-yyyy". Default: null.
   * @param {string} end_date End date of the planning. Format: "dd-MM-yyyy". Default: null.
   * @returns {Promise<PlanningReport>} A report of the planning
   */
  async groupPlanning(cycle, year, city, start_date = null, end_date = null) {
    cycle = cycle.toUpperCase();
    city = this.capitalizeFirstLetter(city);
    let class_group;

    if (year >= 3) {
      if (city == "Brest") {
        class_group = `A${year}${city[0]} Groupe ${cycle} ${this.annee}`;
      } else if (city == "Rennes" && year == "2") {
        class_group = `${cycle}${year} ${city} ${this.annee}`;
      } else {
        class_group = `A${year}${city[0]} ${cycle}${year} ${this.annee}`;
      }
    } else {
      class_group = `${cycle}${year} ${city} ${this.annee}`;
    }

    const information = "Plannings des groupes";
    const id_information = this.id_leftMenu[information];

    const soup = await this.__soupForPlanning(
      this.dataOtherPlanning,
      id_information
    );
    const listOfClasses = soup("li.enfants-entierement-charges li");

    const classPlanning = {};

    listOfClasses.each((index, element) => {
      const spanText = soup(element).find("span.ui-menuitem-text").text();
      const classAttribute = soup(element).attr("class");
      const classId = classAttribute.split("_").pop().split(" ")[0];

      classPlanning[spanText] = classId;
    });

    const id_classPlanning = classPlanning["Plannings " + cycle];

    const soup2 = await this.__soupForPlanning(
      this.dataOtherPlanning,
      id_classPlanning
    );

    const listOfCities = soup2(`li.submenu_${id_classPlanning}`).find("li");

    const classCity = {};

    listOfCities.each((index, element) => {
      const spanText = soup2(element).find("span.ui-menuitem-text").text();
      const classAttribute = soup2(element).attr("class");
      const cityId = classAttribute.split("_").pop().split(" ")[0];

      classCity[spanText] = cityId;
    });

    const id_classCity = classCity["Plannings " + cycle + " " + city];

    const soup3 = await this.__soupForPlanning(
      this.dataOtherPlanning,
      id_classCity
    );

    const listOfYears = soup3(`li.submenu_${id_classCity}`).find("li");

    const classYear = {};

    listOfYears.each((index, child) => {
      const onclickAttribute = soup3(child).find("a").attr("onclick");
      let dictionary = onclickAttribute
        .split("'form',")[1]
        .split(").submit")[0]
        .replace(/'/g, '"');

      try {
        dictionary = JSON.parse(dictionary);
      } catch (error) {
        dictionary = {};
      }

      const yearText = soup3(child).find("span.ui-menuitem-text").text();
      classYear[yearText] = dictionary;
    });

    const payloadOfLastClass = classYear["Plannings " + cycle + " " + year];

    try {
      Object.assign(payloadOfLastClass, this.payload);
    } catch (error) {
      throw new Error("Enter good information please ! ");
    }

    const response = await this.session.post(
      this.baseMainPageUrl,
      payloadOfLastClass
    );
    const html = response.data;

    const $ = cheerio.load(html);
    const allLastClass = $("tbody.ui-datatable-data tr");

    const classGroup = {};

    allLastClass.each((index, child) => {
      const groupText = $(child).find("span.preformatted").text();
      const dataRkAttribute = $(child).attr("data-rk");
      classGroup[groupText] = dataRkAttribute;
    });

    const lastPayload = {
      "form:j_idt193_reflowDD": "0_0",
      "form:j_idt193:j_idt198:filter": "",
      "form:j_idt193_checkbox": "on",
      "form:j_idt193_selection": classGroup[class_group],
      "form:j_idt261": "",
      "form:j_idt271_input": "275805",
    };

    // get payload of the page
    const payload = this.__getPayloadOfThePage(response.data);
    let payload2 = {};
    Object.assign(payload2, payload);
    Object.assign(payload2, lastPayload);

    let planningPage = await this.session.post(
      "https://web.isen-ouest.fr/webAurion/faces/ChoixPlanning.xhtml",
      payload2
    );

    return this.__getWorkingTime(planningPage, start_date, end_date, true);
  }

  /**
   * @param {string} city The campus city
   * @param {string} start_date Start date of the planning. Format: "dd-MM-yyyy". Default: null.
   * @param {string} end_date End date of the planning. Format: "dd-MM-yyyy". Default: null.
   */
  async roomPlanning(city, start_date = null, end_date = null) {
    city = this.capitalizeFirstLetter(city);

    const information = "Plannings des salles";
    const id_information = this.id_leftMenu[information];

    const soup = await this.__soupForPlanning(
      this.dataOtherPlanning,
      id_information
    );
    const listOfClasses = soup("li.enfants-entierement-charges li");

    let classPlanning = {};

    listOfClasses.each((index, element) => {
      const spanText = soup(element).find("span.ui-menuitem-text").text();
      let classAttribute = soup(element).attr("class");
      let classId = classAttribute.split("_").pop().split(" ")[0];

      classPlanning[spanText] = {};

      if (classId === "ui-menuitem") {
        classAttribute = soup(element).find("a.null").attr("class");
        classId = classAttribute.split("_").pop().split(" ")[0];
        let payload = soup(element)
          .find("a.null")
          .attr("onclick")
          .split("'form',")[1]
          .split(").submit")[0]
          .replace(/'/g, '"');
        classPlanning[spanText].payload = JSON.parse(payload);
      }
      classPlanning[spanText].id = classId;
    });

    try {
      Object.assign(classPlanning[city].payload, this.payload);
    } catch (error) {
      throw new Error(
        "Enter good information please ! Only Caen, Rennes, Nantes for the moment"
      );
    }

    const response = await this.session.post(
      this.baseMainPageUrl,
      classPlanning[city].payload
    );
    // console.log(response.data);

    // console.log(response.data);

    const soup3 = cheerio.load(response.data);

    const tbody = soup3("tbody.ui-datatable-data tr");
    const classRoom = {};

    tbody.each((index, child) => {
      const roomText = soup3(child).find("td.TexAlLeft").text();
      const nbPlaces = soup3(child).find("td").eq(2).text();
      const videoProjecteur = soup3(child).find("td").eq(3).text();
      const son = soup3(child).find("td").eq(4).text();
      const retroProjecteur = soup3(child).find("td").eq(5).text();
      const priseElectrique = soup3(child).find("td").eq(6).text();
      const dataRkAttribute = soup3(child).attr("data-rk");
      classRoom[roomText] = {
        nbPlaces: nbPlaces,
        videoProjecteur: videoProjecteur != "",
        son: son != "",
        retroProjecteur: retroProjecteur != "",
        priseElectrique: priseElectrique != "",
        id: dataRkAttribute,
      };
    });

    const lastPayload = {
      "form:j_idt193_reflowDD": "0_0",
      "form:j_idt193:j_idt198:filter": "",
      "form:j_idt193_checkbox": Object.keys(classRoom).map((key, index) => ({
        [index]: "on",
      })),
      "form:j_idt193_selection": Object.values(classRoom)
        .map((salle) => salle.id)
        .join(","),
      "form:j_idt251": "",
      "form:j_idt261_focus": "",
      "form:j_idt261_input": "275805",
    };

    let payload = this.__getPayloadOfThePage(response.data);
    Object.assign(payload, lastPayload);

    let planningPage = await this.session.post(
      "https://web.isen-ouest.fr/webAurion/faces/ChoixPlanning.xhtml",
      payload
    );

    return this.__getWorkingTime(
      planningPage,
      start_date,
      end_date,
      true,
      classRoom
    );
  }

  /**
   * @returns {<string>} The class of the user
   */
  userInfo() {
    const inputString = this.name;

    // parse the name
    const nameParts = inputString.split(" ");

    let firstName = [];
    let lastName = [];

    for (const word of nameParts) {
      if (word === word.toUpperCase()) {
        lastName.push(word);
      } else if (word[0] === word[0].toUpperCase()) {
        firstName.push(word);
      }
    }

    let firstLastName = lastName[0];
    let specEmail = `${firstName
      .join("-")
      .toLowerCase()}.${firstLastName.toLowerCase()}@isen-ouest.yncrea.fr`;

    // list to string
    const firstNameStr = firstName.join(" ");
    const lastNameStr = lastName.join(" ");

    // generate email
    const email = `${firstName.join("-").toLowerCase()}.${lastName
      .join("-")
      .toLowerCase()}@isen-ouest.yncrea.fr`;

    // create the object
    const userInfo = {
      firstname: firstNameStr,
      lastname: lastNameStr,
      name: this.name,
      email: this.removeAccents(email),
    };
    if (lastName.length > 1) {
      userInfo["specEmail"] = this.removeAccents(specEmail);
    }

    return userInfo;
  }

  async getAllUserInformations() {
    const information = "Mon compte";
    const id_information = this.id_leftMenu[information];

    const soup = await this.__soupForPlanning(
      this.dataOtherPlanning,
      id_information
    );
    const listDonnees = soup("li.enfants-entierement-charges li");

    let donnees = {};

    listDonnees.each((index, element) => {
      const spanText = soup(element).find("span.ui-menuitem-text").text();

      donnees[spanText] = {};

      let classData = soup(element).find("a.null").attr("class");
      let id = classData.split("_").pop().split(" ")[0];
      let payload = soup(element)
        .find("a.null")
        .attr("onclick")
        .split("'form',")[1]
        .split(").submit")[0]
        .replace(/'/g, '"');

      donnees[spanText].id = id;
      donnees[spanText].payload = JSON.parse(payload);
    });

    let payload = donnees["Mes informations"].payload;
    Object.assign(payload, this.payload);

    let req = await this.session.post(this.baseMainPageUrl, payload);

    const soup2 = cheerio.load(req.data);

    const classLigne = soup2("div.avec-ligne-separation");

    let data = {};

    classLigne.each((index, element) => {
      const key = soup2(element)
        .find("div.colonne1 span")
        .text()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const spanText = soup2(element).find("div.Container75 span").text();

      data[key] = spanText;
    });

    return data;
  }

  /**
   * Returns an instance of the Moodle class for accessing grades, absences, planning, etc.
   * @returns {Promise<Moodle>} An instance of the Moodle class.
   */
  async moodle() {
    // Get informations from dataClasses.js
    const moodle = new Moodle(this.session, this.cookies);
    await moodle.init();

    // Return the WebAurion object
    return moodle;
  }
}

class WebAurionGrades extends WebAurion {
  constructor(parent, ses, payload) {
    super(parent.session, parent.cookies);
    this.ses = ses;
    this.payload = payload;
  }

  /**
   * Retrieves the grades of the user from the webAurion portal.
   * @returns {Promise<GradeReport>} A GradeReport containing the user's grades.
   */
  async getGrades() {
    const gradeUrl =
      "https://web.isen-ouest.fr/webAurion/faces/LearnerNotationListPage.xhtml";
    // console.log(this.payload);
    const pageGrade = await this.__webAurion(gradeUrl, this.payload, this.ses);
    // console.log(pageGrade.data)
    const soup = cheerio.load(pageGrade.data);

    const title = soup("title").text().trim();
    if (title != "Mes notes") {
      return {
        success: false,
        error: "You are not connected to WebAurion",
        average: "0",
        data: [],
      };
    }

    const result = soup("tr").slice(1);
    const grades = [];
    let gradeSum = 0;
    let gradeCount = 0;

    result.each((index, element) => {
      const tds = soup(element).find("td");
      const [date, code, name, grade, absence, appreciation, instructors] = tds
        .toArray()
        .map((td) => soup(td).text());

      if (date === "Aucun enregistrement") {
        return {
          success: false,
          error: "You are not connected to WebAurion",
          average: "0",
          grades: [],
        };
      }

      if (grade !== "" && grade !== "-") {
        gradeSum += parseFloat(grade);
        gradeCount++;
      }

      const note = new classification.Grade(
        date,
        code,
        name,
        grade,
        absence,
        appreciation,
        instructors
      );
      grades.push(note);
    });

    const gradeAverage =
      gradeCount > 0 ? (gradeSum / gradeCount).toFixed(2) : 0;
    return new classification.GradeReport(gradeAverage, grades);
  }
}

class WebAurionAbsences extends WebAurion {
  constructor(parent, ses, payload) {
    super(parent.session, parent.cookies);
    this.ses = ses;
    this.payload = payload;
  }

  /**
   * Retrieves the absences of the user from the webAurion portal.
   * @returns {Promise<AbsenceReport>} An AbsenceReport containing the user's absences.
   */
  async getAbsences() {
    const absencesUrl =
      "https://web.isen-ouest.fr/webAurion/faces/MesAbsences.xhtml";
    const absencesPage = await this.__webAurion(
      absencesUrl,
      this.payload,
      this.ses
    );
    const soup = cheerio.load(absencesPage.data);

    const title = soup("title").text().trim();
    if (title != "Mes absences") {
      return {
        success: false,
        error: "You are not connected to WebAurion",
        nbAbsences: "0",
        time: "00:00",
        data: [],
      };
    }

    const checkAbsences = soup("tr").slice(6);
    const result = soup("tbody").eq(1).find("tr");
    const total = soup("tbody").eq(2).find("tr");

    if (
      checkAbsences.length === 1 &&
      checkAbsences.eq(0).find("td").eq(0).text() === "Aucune absence."
    ) {
      return new classification.AbsenceReport("0", "0", []);
    }

    const absencesInfo = {
      nbAbsences: total.eq(0).find("td").eq(1).text(),
      time: total.eq(1).find("td").eq(1).text(),
      absences: [],
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
        subject: tds.eq(6).text(),
      });
    });

    const data = absencesInfo.absences.map(
      (a) =>
        new classification.Absence(
          a.date,
          a.reason,
          a.duration,
          a.schedule,
          a.course,
          a.instructor,
          a.subject
        )
    );

    return new classification.AbsenceReport(
      absencesInfo.nbAbsences,
      absencesInfo.time,
      data
    );
  }
}

class WebAurionPlanning extends WebAurion {
  constructor(parent, ses, payload) {
    super(parent.session, parent.cookies);
    this.ses = ses;
    this.payload = payload;
    this.payloadForEvent = {};
    this.language = { "form:j_idt244_input": "275805" }; // Langue Francaise
  }

  /**
   * Get the user's planning
   * @param {string|null} start_date - The start date of the planning. Format: "dd-MM-yyyy". Default: null.
   * @param {string|null} end_date - The end date of the planning. Format: "dd-MM-yyyy". Default: null.
   * @returns {PlanningReport} - A report of the user's planning
   * @throws {Error} - If there's an error
   */
  async getPlanning(start_date = null, end_date = null) {
    try {
      // Request the page to get the payload
      const pagePlanning = await this.__webAurion(
        this.planningUrl,
        this.payload,
        this.ses
      );

      this.payloadForEvent = this.__getPayloadOfThePage(pagePlanning.data);

      // console.log(this.payloadForEvent);

      // Get the working time based on the provided start and end dates
      return this.__getWorkingTime(
        pagePlanning,
        start_date,
        end_date,
        false,
        null,
        this.ses
      );
    } catch (error) {
      // Propagate the error
      throw error;
    }
  }

  async getEvent(id) {
    try {
      let payload = {
        "javax.faces.partial.ajax": "true",
        "javax.faces.source": "form:j_idt118",
        "javax.faces.partial.execute": "form:j_idt118",
        "javax.faces.partial.render":
          "form:modaleDetail form:confirmerSuppression",
        "javax.faces.behavior.event": "eventSelect",
        "javax.faces.partial.event": "eventSelect",
        "form:j_idt118_selectedEventId": id,
      };

      if (Object.keys(this.payloadForEvent).length === 0) {
        const pagePlanning = await this.__webAurion(
          this.planningUrl,
          this.payload,
          this.ses
        );
        this.payloadForEvent = this.__getPayloadOfThePage(pagePlanning.data);
      }

      Object.assign(payload, this.payloadForEvent);

      let regex = /form:j_idt(\d+)_focus/;
      for (const key in this.payloadForEvent) {
        if (this.payloadForEvent.hasOwnProperty(key)) {
          const match = key.match(regex);
          if (match) {
            const number = match[1];
            this.payloadForEvent[`form:j_idt${number}_input`] = "275805";
          }
        }
      }

      const response = await this.session.post(
        this.planningUrl,
        payload,
        this.ses
      );
      const htmlString = response.data
        .replace(/<\?xml.*\?>/g, "")
        .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1");

      const soup = cheerio.load(htmlString, { xmlMode: false });

      const modaleDetailContent = soup("#form\\:modaleDetail");

      const texts = {};
      const result = modaleDetailContent.find("div.ui-panelgrid-cell");

      for (let i = 0; i < result.length; i++) {
        if (i % 2 === 0) {
          const key = soup(result[i]).text().trim();
          const value = soup(result[i + 1])
            .text()
            .trim();
          texts[key] = value;
        }
      }

      const ul = modaleDetailContent.find("ul.ui-tabs-nav");
      const li = ul.find("li");
      const tabs = {};
      for (let i = 0; i < li.length; i++) {
        const a = soup(li[i]).find("a");
        let text = a.text().trim();
        const href = a.attr("href");

        let information = {};
        const div = modaleDetailContent.find(`div${href.replace(/:/g, "\\:")}`);
        // get table
        const table = div.find("table");
        const th = table.find("th");
        const td = table.find("td");

        if (text.split(" ")[0] === "Apprenants") {
          text = "apprenants";
          const tbody = table.find("tbody");
          const tr = tbody.find("tr");
          const students = [];
          for (let j = 0; j < tr.length; j++) {
            const td = soup(tr[j]).find("td");
            const student = {
              nom: soup(td[0]).text().trim(),
              prenom: soup(td[1]).text().trim(),
            };
            students.push(student);
          }
          information["students"] = students;
          information["nbStudents"] = students.length;
        } else {
          for (let j = 0; j < th.length; j++) {
            const key = soup(th[j]).text().trim();
            const value = soup(td[j]).text().trim();
            information[key] = value;
          }
        }
        tabs[this.removeAccents(text.toLowerCase())] = information;
      }

      tabs["informations"] = texts;

      return tabs;
    } catch (error) {
      console.error(
        "Une erreur est survenue lors de la récupération de l'évènement du planning"
      );
      // console.error(error);
    }
  }
}

/**
 * Represents a connection to the Moodle portal.
 */
class Moodle {
  /**
   * Creates a new instance of WebAurion.
   * @param {AxiosInstance} session - An Axios session for making HTTP requests.
   * @param {Array} cookies - An array of cookies to be used for requests.
   */
  constructor(session, cookies) {
    // Initialization of instance variables
    this.ses = session;
    this.cook = cookies;
    this.baseUrl = "https://web.isen-ouest.fr/moodle4/my/courses.php";
  }

  async init() {
    const baseReq = await this.ses.get(this.baseUrl, {
      maxRedirects: 0,
      validateStatus: function () {
        return true;
      },
    });
    this.updateCookies(baseReq.headers["set-cookie"]);
    let url = baseReq.headers.location;
    let response;
    let redirCount = 0;
    do {
      redirCount++;
      response = await this.ses.get(url, {
        maxRedirects: 0,
        validateStatus: function () {
          return true;
        },
      });

      if (response.headers["set-cookie"])
        this.updateCookies(response.headers["set-cookie"]);

      if (response.status >= 300 && response.status < 400) {
        // new redirection
        url = response.headers.location;
      } else {
        break;
      }
    } while (
      response.status >= 300 &&
      response.status < 400 &&
      redirCount++ < 20
    );

    // let importantCookie = this.cookies[0];
    // this.cookies = [importantCookie];
    // this.updateSession();
  }

  /**
   * Updates the Axios session with the current cookies.
   */
  updateSession() {
    this.ses = axios.create({
      withCredentials: true,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64; rv:103.0) Gecko/20100101 Firefox/103.0",
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: this.cook.join("; "),
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
      for (let j = 0; j < this.cook.length; j++) {
        if (this.cook[j].startsWith(cookieName)) {
          this.cook[j] = cookie;
          cookieExist = true;
        }
      }
      if (!cookieExist) {
        this.cook.push(cookie);
      }
    }
    this.updateSession();
  }

  getCookie(cookieName) {
    for (let i = 0; i < this.cook.length; i++) {
      if (this.cook[i].startsWith(cookieName)) {
        return this.cook[i];
      }
    }
    return null;
  }

  async doRequest(url, post = false) {

    // this.updateSession();
    let response;
    if (post) {
      response = await this.ses.post(url, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        },
      });
    } else {
      response = await this.ses.get(url, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        },
      });
    }
    if (response.status >= 300 && response.status < 400) {
      const redirectUrl = response.headers.location;
      if (redirectUrl) {
        response = await this.doRequest(redirectUrl, post);
      }
    }
    return response;
  }
}

module.exports = {
  WebAurion,
  Moodle,
};
