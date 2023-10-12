/**
 * Represents a class member with basic information such as name, mail, and avatar URL.
 */
class ClassMember {
  /**
   * Creates a new instance of ClassMember.
   * @param {string} name - The name of the class member.
   * @param {string} mail - The email of the class member.
   * @param {string} avatar_url - The URL of the class member's avatar.
   */
  constructor(name, mail, avatar_url) {
    this.name = name;
    this.mail = mail;
    this.avatar_url = avatar_url;
  }

  /**
   * Returns a string representation of the ClassMember.
   * @returns {string} A string containing the member's name, mail, and avatar URL.
   */
  toString() {
    return `ClassMember(name='${this.name}', mail='${this.mail}', avatar_url='${this.avatar_url}')`;
  }

  /**
   * Gets the value of a specific key for the ClassMember.
   * @param {string} key - The key representing the requested value ('name', 'mail', 'avatar_url').
   * @returns {string} The value associated with the given key.
   * @throws {Error} Throws an error if the key is not valid.
   */
  getItem(key) {
    if (key === "name") {
      return this.name;
    } else if (key === "mail") {
      return this.mail;
    } else if (key === "avatar_url") {
      return this.avatar_url;
    } else {
      throw new Error(
        `Invalid key: ${key}, valid keys are 'name', 'mail', and 'avatar_url'`
      );
    }
  }

  toJSON() {
    // Allows converting ClassMember object to JSON format
    return {
      name: this.name,
      mail: this.mail,
      avatar_url: this.avatar_url,
    };
  }
}

/**
 * Represents a report about class members, including the number of members and data about each member.
 */
class ClassMemberReport {
  /**
   * Creates a new instance of ClassMemberReport.
   * @param {number} nbMembers - The number of class members.
   * @param {Array} data - An array of ClassMember objects representing the members' data.
   */
  constructor(nbMembers, data) {
    this.nbMembers = nbMembers;
    this.data = data;
  }

  /**
   * Returns a string representation of the ClassMemberReport.
   * @returns {string} A string containing the number of members and the data array.
   */
  toString() {
    return `ClassMemberReport(nbMembers=${this.nbMembers}, data=${this.data})`;
  }

  /**
   * Gets the value of a specific key for the ClassMemberReport.
   * @param {string} key - The key representing the requested value ('nbMembers', 'data').
   * @returns {number|Array} The value associated with the given key.
   * @throws {Error} Throws an error if the key is not valid.
   */
  getItem(key) {
    if (key === "nbMembers") {
      return this.nbMembers;
    } else if (key === "data") {
      return this.data;
    } else {
      throw new Error(
        `Invalid key: ${key}, valid keys are 'nbMembers' and 'data'`
      );
    }
  }

  toJSON() {
    // Allows converting ClassMemberReport object to JSON format
    return {
      nbMembers: this.nbMembers,
      data: this.data.map((i) => i.toJSON()),
    };
  }
}
/**
 * Represents a grade with detailed information including date, code, name, grade, absence, appreciation, and instructors.
 */
class Grade {
  /**
   * Creates a new instance of Grade.
   * @param {string} date - The date of the grade.
   * @param {string} code - The code associated with the grade.
   * @param {string} name - The name of the grade.
   * @param {number} grade - The numerical grade value.
   * @param {boolean} absence - Indicates if there was an absence for this grade.
   * @param {string} appreciation - Any additional appreciation or comments.
   * @param {Array} instructors - An array of instructor names.
   */
  constructor(date, code, name, grade, absence, appreciation, instructors) {
    this.date = date;
    this.code = code;
    this.name = name;
    this.grade = grade;
    this.absence = absence;
    this.appreciation = appreciation;
    this.instructors = instructors;
  }

  /**
   * Returns a string representation of the Grade.
   * @returns {string} A string containing the grade's attributes.
   */
  toString() {
    return `Grade(date='${this.date}', code='${this.code}', name='${this.name}', grade='${this.grade}', absence='${this.absence}', appreciation='${this.appreciation}', instructors='${this.instructors}')`;
  }

  /**
   * Gets the value of a specific key for the Grade.
   * @param {string} key - The key representing the requested value ('date', 'code', 'name', 'grade', 'absence', 'appreciation', 'instructors').
   * @returns {string|number|boolean|Array} The value associated with the given key.
   * @throws {Error} Throws an error if the key is not valid.
   */
  get(key) {
    if (key === "date") {
      return this.date;
    } else if (key === "code") {
      return this.code;
    } else if (key === "name") {
      return this.name;
    } else if (key === "grade") {
      return this.grade;
    } else if (key === "absence") {
      return this.absence;
    } else if (key === "appreciation") {
      return this.appreciation;
    } else if (key === "instructors") {
      return this.instructors;
    } else {
      throw new Error(
        `Invalid key: ${key}, valid keys are 'date', 'code', 'name', 'grade', 'absence', 'appreciation', and 'instructors'`
      );
    }
  }

  toJSON() {
    // Allows converting Grade object to JSON format
    return {
      date: this.date,
      code: this.code,
      name: this.name,
      grade: this.grade,
      absence: this.absence,
      appreciation: this.appreciation,
      instructors: this.instructors,
    };
  }
}

/**
 * Represents a report about grades, including the average grade and data about each grade.
 */
class GradeReport {
  /**
   * Creates a new instance of GradeReport.
   * @param {number} grade_average - The average grade value.
   * @param {Array} grades - An array of Grade objects representing individual grades.
   */
  constructor(grade_average, grades) {
    this.average = grade_average;
    this.grades = grades;
  }

  /**
   * Returns a string representation of the GradeReport.
   * @returns {string} A string containing the average grade and the data array.
   */
  toString() {
    return `GradeReport(average=${this.average}, data=${this.grades})`;
  }

  /**
   * Gets the value of a specific key for the GradeReport.
   * @param {string} key - The key representing the requested value ('average', 'data').
   * @returns {number|Array} The value associated with the given key.
   * @throws {Error} Throws an error if the key is not valid.
   */
  get(key) {
    if (key === "average") {
      return this.average;
    } else if (key === "data") {
      return this.grades;
    } else {
      throw new Error(
        `Invalid key: ${key}, valid keys are 'average' and 'data'`
      );
    }
  }

  toJSON() {
    // Allows converting GradeReport object to JSON format
    // retuen with grade.toJSON()
    return {
      average: this.average,
      data: this.grades.map((i) => i.toJSON()),
    };
  }
}
/**
 * Represents an absence with details including date, reason, duration, schedule, course, instructor, and subject.
 */
class Absence {
  /**
   * Creates a new instance of Absence.
   * @param {string} date - The date of the absence.
   * @param {string} reason - The reason for the absence.
   * @param {string} duration - The duration of the absence.
   * @param {string} schedule - The schedule affected by the absence.
   * @param {string} course - The course affected by the absence.
   * @param {string} instructor - The name of the instructor for the course.
   * @param {string} subject - The subject of the course.
   */
  constructor(date, reason, duration, schedule, course, instructor, subject) {
    this.date = date;
    this.reason = reason;
    this.duration = duration;
    this.schedule = schedule;
    this.course = course;
    this.instructor = instructor;
    this.subject = subject;
  }

  /**
   * Returns a string representation of the Absence.
   * @returns {string} A string containing the absence's attributes.
   */
  toString() {
    return `Absence(date='${this.date}', reason='${this.reason}', duration='${this.duration}', schedule='${this.schedule}', course='${this.course}', instructor='${this.instructor}', subject='${this.subject}')`;
  }

  /**
   * Gets the value of a specific key for the Absence.
   * @param {string} key - The key representing the requested value ('date', 'reason', 'duration', 'schedule', 'course', 'instructor', 'subject').
   * @returns {string} The value associated with the given key.
   * @throws {Error} Throws an error if the key is not valid.
   */
  get(key) {
    if (key === "date") {
      return this.date;
    } else if (key === "reason") {
      return this.reason;
    } else if (key === "duration") {
      return this.duration;
    } else if (key === "schedule") {
      return this.schedule;
    } else if (key === "course") {
      return this.course;
    } else if (key === "instructor") {
      return this.instructor;
    } else if (key === "subject") {
      return this.subject;
    } else {
      throw new Error(
        `Invalid key: ${key}, valid keys are 'date', 'reason', 'duration', 'schedule', 'course', 'instructor', and 'subject'`
      );
    }
  }

  toJSON() {
    // Allows converting Absence object to JSON format
    return {
      date: this.date,
      reason: this.reason,
      duration: this.duration,
      schedule: this.schedule,
      course: this.course,
      instructor: this.instructor,
      subject: this.subject,
    };
  }
}

/**
 * Represents a report about absences, including the number of absences, time, and data about each absence.
 */
class AbsenceReport {
  /**
   * Creates a new instance of AbsenceReport.
   * @param {number} nbAbsences - The number of absences.
   * @param {string} time - The time of the absence report.
   * @param {Array} data - An array of Absence objects representing individual absences.
   */
  constructor(nbAbsences, time, data) {
    this.nbAbsences = nbAbsences;
    this.time = time;
    this.data = data;
  }

  /**
   * Returns a string representation of the AbsenceReport.
   * @returns {string} A string containing the number of absences, time, and the data array.
   */
  toString() {
    return `AbsenceReport(nbAbsences=${this.nbAbsences}, time=${this.time}, data=${this.data})`;
  }

  /**
   * Gets the value of a specific key for the AbsenceReport.
   * @param {string} key - The key representing the requested value ('nbAbsences', 'time', 'data').
   * @returns {number|string|Array} The value associated with the given key.
   * @throws {Error} Throws an error if the key is not valid.
   */
  get(key) {
    if (key === "nbAbsences") {
      return this.nbAbsences;
    } else if (key === "time") {
      return this.time;
    } else if (key === "data") {
      return this.data;
    } else {
      throw new Error(
        `Invalid key: ${key}, valid keys are 'nbAbsences', 'time', and 'data'`
      );
    }
  }

  toJSON() {
    // Allows converting AbsenceReport object to JSON format
    return {
      nbAbsences: this.nbAbsences,
      time: this.time,
      data: this.data.map((i) => i.toJSON()),
    };
  }
}

class Event {
  constructor(
    id,
    start,
    end,
    class_name,
    type,
    subject,
    description,
    instructors,
    start_time,
    end_time,
    room,
    class_info
  ) {
    // Constructor to initialize Event object attributes
    this.id = id;
    this.start = start;
    this.end = end;
    this.class_name = class_name;
    this.type = type;
    this.subject = subject;
    this.description = description;
    this.instructors = instructors;
    this.start_time = start_time;
    this.end_time = end_time;
    this.room = room;
    this.class_info = class_info;
  }

  toString() {
    // Returns a string representation of the Event object
    return `Event(id='${this.id}', start='${this.start}', end='${this.end}', class_name='${this.class_name}', type='${this.type}', subject='${this.subject}', description='${this.description}', instructors='${this.instructors}', start_time='${this.start_time}', end_time='${this.end_time}', room='${this.room}', class_info='${this.class_info}')`;
  }

  toJSON() {
    // Allows converting Event object to JSON format
    return {
      id: this.id,
      start: this.start,
      end: this.end,
      class_name: this.class_name,
      type: this.type,
      subject: this.subject,
      description: this.description,
      instructors: this.instructors,
      start_time: this.start_time,
      end_time: this.end_time,
      room: this.room,
      class_info: this.class_info,
    };
  }
}

class PlanningReport {
  constructor(events, infoSalles) {
    // Constructor to initialize PlanningReport object attributes
    this.data = events;
    this.infoSalles = infoSalles;
  }

  toString() {
    // Returns a string representation of the PlanningReport object
    return `PlanningReport(data=${JSON.stringify(
      this.data
    )}, infoSalles=${JSON.stringify(this.infoSalles)})`;
  }

  toJSON() {
    // Allows converting PlanningReport object to JSON format
    return {
      data: this.data.map((i) => i.toJSON()),
      infoSalles: this.infoSalles,
    };
  }
}

/**
 * Represents a data entry for a school report.
 */
class SchoolReportData {
  /**
   * Creates a new instance of SchoolReportData.
   * @param {string} name - The name of the report.
   * @param {string} id - The ID of the report.
   */
  constructor(name, id) {
    this.name = name;
    this.id = id;
  }

  /**
   * Returns a string representation of the SchoolReportData object.
   * @returns {string} A string representation of the object.
   */
  toString() {
    return `SchoolReportData(name='${this.name}', id='${this.id}')`;
  }

  /**
   * Allows accessing attributes using dictionary-like syntax.
   * @param {string} key - The key to access the attribute.
   * @returns {string} The value of the specified attribute.
   * @throws {Error} Throws an error if the key is invalid.
   */
  get(key) {
    if (key === "name") {
      return this.name;
    } else if (key === "id") {
      return this.id;
    } else {
      throw new Error(`Invalid key: ${key}, valid keys are 'name' and 'id'`);
    }
  }

  toJSON() {
    // Allows converting SchoolReportData object to JSON format
    return {
      name: this.name,
      id: this.id,
    };
  }
}

/**
 * Represents a school report.
 */
class SchoolReport {
  /**
   * Creates a new instance of SchoolReport.
   * @param {number} nbReports - The number of reports.
   * @param {Array<SchoolReportData>} data - An array of SchoolReportData objects.
   */
  constructor(nbReports, data) {
    this.nbReports = nbReports;
    this.data = data;
  }

  /**
   * Returns a string representation of the SchoolReport object.
   * @returns {string} A string representation of the object.
   */
  toString() {
    return `SchoolReport(nbReports=${this.nbReports}, data=${JSON.stringify(
      this.data
    )})`;
  }

  /**
   * Allows accessing attributes using dictionary-like syntax.
   * @param {string} key - The key to access the attribute.
   * @returns {number|Array<SchoolReportData>} The value of the specified attribute.
   * @throws {Error} Throws an error if the key is invalid.
   */
  get(key) {
    if (key === "nbReports") {
      return this.nbReports;
    } else if (key === "data") {
      return this.data;
    } else {
      throw new Error(
        `Invalid key: ${key}, valid keys are 'nbReports' and 'data'`
      );
    }
  }

  toJSON() {
    // Allows converting SchoolReport object to JSON format
    return {
      nbReports: this.nbReports,
      data: this.data.map((i) => i.toJSON()),
    };
  }
}

// Export all classes for use in other modules
module.exports = {
  ClassMember: ClassMember,
  ClassMemberReport: ClassMemberReport,
  Grade: Grade,
  GradeReport: GradeReport,
  Absence: Absence,
  AbsenceReport: AbsenceReport,
  Event: Event,
  PlanningReport: PlanningReport,
  SchoolReportData: SchoolReportData,
  SchoolReport: SchoolReport,
};
