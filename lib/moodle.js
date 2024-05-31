const axios = require('axios');

// /**
//  * Represents a connection to the Moodle portal.
//  */
// class Moodle {
//     /**
//      * Creates a new instance of Moodle.
//      * @param {AxiosInstance} session - An Axios session for making HTTP requests.
//      */
//     constructor(session) {
//         this.session = session;
//         this.cookies = {}; // Utilisez un objet pour stocker les cookies
//         this.baseUrl = "https://web.isen-ouest.fr/moodle4/my/courses.php";
//     }
  
//     async init() {
//         let response = await this.session.get(this.baseUrl, {
//             maxRedirects: 0,
//             validateStatus: status => status < 500 // Acceptez toutes les réponses en dessous de 500
//         });
        
//         this.updateCookies(response.headers["set-cookie"]);
//         let url = response.headers.location || this.baseUrl;
//         let redirectCount = 0;

//         while (redirectCount < 20 && response.status >= 300 && response.status < 400) {
//             response = await this.session.get(url, {
//                 maxRedirects: 0,
//                 validateStatus: status => status < 500
//             });
            
//             this.updateCookies(response.headers["set-cookie"]);
//             if (response.headers.location) {
//                 url = response.headers.location;
//             } else {
//                 break; // Arrêtez la boucle si aucune nouvelle location n'est fournie
//             }
//             redirectCount++;
//         }

//         if (redirectCount >= 20) {
//             throw new Error('Too many redirects');
//         }
//     }

//     updateCookies(newCookies) {
//         if (newCookies) {
//             newCookies.forEach(cookie => {
//                 const parts = cookie.split(";")[0];
//                 const [name, value] = parts.split('=');
//                 this.cookies[name] = value;
//             });
//         }
//         this.session.defaults.headers["Cookie"] = this.getCookieString();
//     }

//     getCookieString() {
//         return Object.entries(this.cookies).map(([name, value]) => `${name}=${value}`).join('; ');
//     }

//     async testRequest() {
//         try {
//             const response = await this.session.get(this.baseUrl);
//             console.log(response.data);
//         } catch (error) {
//             console.error('Test request error:', error);
//         }
//     }
// }


/**
 * Represents a connection to the Moodle portal.
 */
class Moodle {
    /**
     * Creates a new instance of WebAurion.
     * @param {AxiosInstance} session - An Axios session for making HTTP requests.
     */
    constructor(session) {
      // Initialization of instance variables
      this.ses = session;
      this.cook = this.getEssencialCookie(this.ses.defaults.headers.Cookie.split("; "));
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
  
      this.cook = this.getEssencialCookie(this.cook , ["MoodleSession"]);
      this.updateSession();
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
  
    getEssencialCookie(cookies, essencials = ["JSESSIONID", "AUTH_SESSION_ID", "KC_RESTART", "AUTH_SESSION_ID_LEGACY", "KEYCLOAK_LOCALE", "KEYCLOAK_IDENTITY"]) {
      let essencial = [];
      for (let i = 0; i < cookies.length; i++) {
        let cookieName = cookies[i].split("=")[0];
        if (essencials.includes(cookieName)) {
          essencial.push(cookies[i]);
        }
      }
      return essencial;
    }
  
    removeCookiesDuplicate() {
      let newCookie = [];
      for (let i = 0; i < this.cook.length; i++) {
        let cookieName = this.cook[i].split("=")[0];
        let cookieExist = false;
        for (let j = 0; j < newCookie.length; j++) {
          if (newCookie[j].startsWith(cookieName)) {
            cookieExist = true;
          }
        }
        if (!cookieExist) {
          newCookie.push(this.cook[i]);
        }
      }
      this.cook = newCookie;
    }
  
    getCookie(cookieName) {
      for (let i = 0; i < this.cook.length; i++) {
        if (this.cook[i].startsWith(cookieName)) {
          return this.cook[i];
        }
      }
      return null;
    }

    async testRequest() {
        try {
            const response = await this.ses.get(this.baseUrl);
            console.log(response.data);
        } catch (error) {
            console.error('Test request error:', error);
        }
  }
}

module.exports = {
    Moodle
};
