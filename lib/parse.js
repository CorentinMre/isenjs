


const classification = require("./classification");
const cheerio = require("cheerio");


class BeautifulGrade {
  

    static grades(html){
  
      // console.log(html);
      const soup = cheerio.load(html);
  
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
  
  
  
  class BeautifulAbsences {
    static absences(html) {
      const soup = cheerio.load(html);
  
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
  
  
  class BeautifulPlanning {
  
  
    static planning(html) {
  
      const htmlString = html
          .replace(/<\?xml.*\?>/g, "")
          .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1");
  
  
      const soup = cheerio.load(htmlString, { xmlMode: false });
  
  
      const json_data = soup("#form\\:j_idt118").text();
      
      let events = [];
      try {
          events = JSON.parse(json_data).events;
      } catch (error) {
          // console.error("Erreur de parsing JSON:", error);
          // return null;
          return {
            success: false,
            error: "You are not connected to WebAurion",
            // nbAbsences: "0",
            // time: "00:00",
            data: [],
          };
      }
  
      const parseEventTitle = (title) => {
          const parts = title.split(' - ');
          return {
              time: parts[0].trim(),
              room: parts[1].trim(),
              type: parts[3].trim(),
              subject: parts[4].trim(),
              instructors: parts[5].split('/').map(instr => instr.trim()),
              classGroups: parts[6] ? parts[6].split('/').map(group => group.trim()) : []
          };
      };
  
      const eventDetails = events.map(event => {
          const details = parseEventTitle(event.title);
          return new classification.Event({
              id: event.id,
              // title: event.title,
              startTime: event.start,
              endTime: event.end,
              // allDay: event.allDay,
              className: event.className,
              // Ajout des détails enrichis
              details
          });
      });
  
      return new classification.PlanningReport(eventDetails);
  }
  
}  

module.exports = {
  BeautifulGrade,
  BeautifulAbsences,
  BeautifulPlanning
};