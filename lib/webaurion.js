


const axios = require('axios');
const cheerio = require('cheerio');

const { BeautifulGrade, BeautifulAbsences, BeautifulPlanning } = require('./parse.js');

const { Moodle } = require('./moodle.js');

class WebAurion {
  constructor() {

    this.baseUrl = "https://web.isen-ouest.fr";
    this.cookies = '';
    this.ViewState = "";
    this.link = {};
    this.timeConnection;
    this.gradeData;
    this.name = "";

    this.logged_in = false;
  }


  async login(username, password) {
    try {
      const payload = { username, password, j_idt27: "" };
  
      // console.log('Logging');
      let response = await axios.post(`${this.baseUrl}/webAurion/login`, payload, {
        headers: {
          ...this._getRequestHeaders(),
          'content-type': 'application/x-www-form-urlencoded',
          'cookie': this.cookies,
          // 'maxRedirects': 0,
        },
        maxRedirects: 0,
        validateStatus: function (status) {
          return status === 302; 
        }
      });

      // let url = response.headers.location;
      // response = await axios.get(url, {
      //   headers: {
      //     ...this._getRequestHeaders(),
      //     'cookie': this.cookies,
      //   },
      // });

      // // console.log(response.headers);
      // response.headers['set-cookie'].forEach(cookie => {
      //   this.cookies += `; ${cookie.split(';')[0]}`;
      // });
  
      // response.headers['set-cookie'].forEach(cookie => {
      //   this.cookies += `; ${cookie.split(';')[0]}`;
      // });

      this.cookies = response.headers['set-cookie'][0].split(';')[0];

      // response.headers['set-cookie'].forEach(cookie => {
      //   this.cookies += `; ${cookie.split(';')[0]}`;
      // });

      // console.log(this.cookies);
      

      // go to the main page
      response = await axios.get(`${this.baseUrl}/webAurion/`, {
        headers: {
          ...this._getRequestHeaders(),
          'cookie': this.cookies,
        },
      });
      


      // console.log(response.headers);
      // this.cookies = response.headers['set-cookie'][0].split(';')[0];


      this.ViewState = this._getViewState(response.data, true);
      // console.log(this.link);
      // console.log(this._getViewState(response.data));


      this.logged_in = true;
      return { success: true, message: 'Login successful', data: response };
    } catch (error) {
      console.error('Error logging in:', error);
      return { success: false, message: 'Login failed', data: error };
    }
  }

  /**
   * Removes accents from a string.
   */
  removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }



  async doRequest(payload) {
    const response = await axios.post(`${this.baseUrl}/webAurion/faces/MainMenuPage.xhtml`, payload, {
      headers: {
        ...this._getRequestHeaders(),
        'cookie': this.cookies,
      },
    });

    // console.log(response.data);
    return response

  }


  



  _getViewState(html, first = false) {


    const $ = cheerio.load(html);

    if (first) {
      this.name = $("div.menuMonCompte").find("h3").text();
    }
    

    // const planningLink = $('a:contains("Planning")').attr('id');
    // const gradesLink = $('a:contains("Dernière note")').attr('id');
    // const AbsencesLink = $('a:contains("Absences à justifier")').attr('id');

    return $('input[name="javax.faces.ViewState"]').val();

    // return {
    //   planning: planningLink,
    //   grades: gradesLink,
    //   absences: AbsencesLink,
    //   ViewState: this.ViewState,
    // }
  }

  

  _getRequestHeaders() {
    return {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
    "cache-control": "no-cache",
    "content-type": "application/x-www-form-urlencoded",
    "pragma": "no-cache",
    "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\"",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "Referer": "https://web.isen-ouest.fr/webAurion/",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome"
    };
  }


  _getGradesPayload() {
    return `form=form&form%3AlargeurDivCenter=1170&form%3AidInit=webscolaapp.MainMenuPage_-675937918615994690&form%3Asauvegarde=&form%3Aj_idt757%3Aj_idt759_dropdown=1&form%3Aj_idt757%3Aj_idt759_mobiledropdown=1&form%3Aj_idt757%3Aj_idt759_page=0&form%3Aj_idt805%3Aj_idt808_view=basicDay&form%3Aj_idt820_focus=&form%3Aj_idt820_input=275805&javax.faces.ViewState=${this.ViewState}&form%3Aj_idt757%3Aj_idt759%3Aj_idt763=form%3Aj_idt757%3Aj_idt759%3Aj_idt763`;
  }

  _getAbsencesPayload() {
    return `form=form&form%3AlargeurDivCenter=624&form%3AidInit=webscolaapp.MainMenuPage_-2650371312801958593&form%3Asauvegarde=&form%3Aj_idt757%3Aj_idt759_dropdown=1&form%3Aj_idt757%3Aj_idt759_mobiledropdown=1&form%3Aj_idt757%3Aj_idt759_page=0&form%3Aj_idt805%3Aj_idt808_view=basicDay&form%3Aj_idt820_focus=&form%3Aj_idt820_input=275805&javax.faces.ViewState=${this.ViewState}&form%3Aj_idt787=form%3Aj_idt787`;
  }



  _getPlanningPayload() {
    return `form=form&form%3AlargeurDivCenter=624&form%3AidInit=webscolaapp.MainMenuPage_9196152151037045023&form%3Asauvegarde=&form%3Aj_idt757%3Aj_idt759_dropdown=1&form%3Aj_idt757%3Aj_idt759_mobiledropdown=1&form%3Aj_idt757%3Aj_idt759_page=0&form%3Aj_idt805%3Aj_idt808_view=basicDay&form%3Aj_idt820_focus=&form%3Aj_idt820_input=275805&javax.faces.ViewState=${this.ViewState}&form%3Aj_idt800=form%3Aj_idt800`;
  }

  _getPlanningPayload2(viewState) {
    let start_date = new Date();
    start_date.setMonth(start_date.getMonth() - 3);
    let end_date = new Date();
    end_date.setMonth(end_date.getMonth() + 10);
    let start_timestamp = start_date.getTime();
    let end_timestamp = end_date.getTime();
    return `javax.faces.partial.ajax=true&javax.faces.source=form%3Aj_idt118&javax.faces.partial.execute=form%3Aj_idt118&javax.faces.partial.render=form%3Aj_idt118&form%3Aj_idt118=form%3Aj_idt118&form%3Aj_idt118_start=${start_timestamp}&form%3Aj_idt118_end=${end_timestamp}&form=form&form%3AlargeurDivCenter=&form%3AidInit=webscolaapp.Planning_-5219369535766895590&form%3Adate_input=27%2F05%2F2024&form%3Aweek=22-2024&form%3Aj_idt118_view=agendaWeek&form%3AoffsetFuseauNavigateur=-7200000&form%3Aonglets_activeIndex=0&form%3Aonglets_scrollState=0&form%3Aj_idt244_focus=&form%3Aj_idt244_input=275805&javax.faces.ViewState=${viewState}`;
  }


  async getGrades() {

      // if (new Date().getTime() - this.timeConnection > 30000) {
      //   return await this.doRequest(this._getGradesPayload());
      // }

      const data = await this.doRequest(this._getGradesPayload());

      return BeautifulGrade.grades(data.data);
  }

  async getAbsences() {
    const data = await this.doRequest(this._getAbsencesPayload());
    return BeautifulAbsences.absences(data.data);
  }

  async getPlanning() {
    let response = await axios.post(`${this.baseUrl}/webAurion/faces/MainMenuPage.xhtml`, this._getPlanningPayload(), {
      headers: {
        ...this._getRequestHeaders(),
        'cookie': this.cookies,
      },
    });


    // console.log(this.ViewState);
    // this._getViewState(response.data);
    // console.log(this.ViewState);

    response = await axios.post(`${this.baseUrl}/webAurion/faces/Planning.xhtml`, this._getPlanningPayload2(this._getViewState(response.data)), {
      headers: {
        ...this._getRequestHeaders(),
        'cookie': this.cookies,
        
      },
    });


    return BeautifulPlanning.planning(response.data);

  }


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


  async moodle() {

    // session creation
    const session = axios.create({
      withCredentials: true,
      headers: {
        // ...this._getRequestHeaders(),
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64; rv:103.0) Gecko/20100101 Firefox/103.0",
        "Content-Type": "application/x-www-form-urlencoded",
        'Cookie': this.cookies,
      },
    });

    console.log(this.cookies);  


    const moodle = new Moodle(session);
    await moodle.init();
    return moodle;
  }


}



module.exports = {
  WebAurion,
}