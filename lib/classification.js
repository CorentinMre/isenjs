class ClassMember {
    constructor(name, mail, avatar_url) {
        this.name = name;
        this.mail = mail;
        this.avatar_url = avatar_url;
    }

    toString() {
        return `ClassMember(name='${this.name}', mail='${this.mail}', avatar_url='${this.avatar_url}')`;
    }

    getItem(key) {
        if (key === 'name') {
            return this.name;
        } else if (key === 'mail') {
            return this.mail;
        } else if (key === 'avatar_url') {
            return this.avatar_url;
        } else {
            throw new Error(`Invalid key: ${key}, valid keys are 'name', 'mail', and 'avatar_url'`);
        }
    }

    getDict(){
        let dict = {"name" : this.name, "mail": this.mail, "avatar_url": this.avatar_url};
        return dict;
    }
}

class ClassMemberReport {
    constructor(nbMembers, data) {
        this.nbMembers = nbMembers;
        this.data = data;
    }

    toString() {
        return `ClassMemberReport(nbMembers=${this.nbMembers}, data=${this.data})`;
    }

    getItem(key) {
        if (key === 'nbMembers') {
            return this.nbMembers;
        } else if (key === 'data') {
            return this.data;
        } else {
            throw new Error(`Invalid key: ${key}, valid keys are 'nbMembers' and 'data'`);
        }
    }

    getDict(){
        let dict = {"nbMembers" : this.nbMembers, "data": []};
        for (let i = 0; i < this.data.length; i++) {
            dict["data"].push(this.data[i].getDict());
        }
        return dict;
    }
}

class Grade {
    constructor(date, code, name, grade, absence, appreciation, instructors) {
        this.date = date;
        this.code = code;
        this.name = name;
        this.grade = grade;
        this.absence = absence;
        this.appreciation = appreciation;
        this.instructors = instructors;
    }

    toString() {
        return `Grade(date='${this.date}', code='${this.code}', name='${this.name}', grade='${this.grade}', absence='${this.absence}', appreciation='${this.appreciation}', instructors='${this.instructors}')`;
    }

    get(key) {
        if (key === 'date') {
            return this.date;
        } else if (key === 'code') {
            return this.code;
        } else if (key === 'name') {
            return this.name;
        } else if (key === 'grade') {
            return this.grade;
        } else if (key === 'absence') {
            return this.absence;
        } else if (key === 'appreciation') {
            return this.appreciation;
        } else if (key === 'instructors') {
            return this.instructors;
        } else {
            throw new Error(`Invalid key: ${key}, valid keys are 'date', 'code', 'name', 'grade', 'absence', 'appreciation', and 'instructors'`);
        }
    }

    getDict(){
        let dict = {"date" : this.date, "code": this.code, "name": this.name, "grade": this.grade, "absence": this.absence, "appreciation": this.appreciation, "instructors": this.instructors};
        return dict;
    }
}

class GradeReport {
    constructor(grade_average, grades) {
        this.average = grade_average;
        this.grades = grades;
    }

    toString() {
        return `GradeReport(average=${this.average}, data=${this.grades})`;
    }

    get(key) {
        if (key === 'average') {
            return this.average;
        } else if (key === 'data') {
            return this.grades;
        } else {
            throw new Error(`Invalid key: ${key}, valid keys are 'average' and 'data'`);
        }
    }

    getDict(){
        let dict = {"average" : this.average, "data": []};
        for (let i = 0; i < this.grades.length; i++) {
            dict["data"].push(this.grades[i].getDict());
        }
        return dict;
    }
}

class Absence {
    constructor(date, reason, duration, schedule, course, instructor, subject) {
        this.date = date;
        this.reason = reason;
        this.duration = duration;
        this.schedule = schedule;
        this.course = course;
        this.instructor = instructor;
        this.subject = subject;
    }

    toString() {
        return `Absence(date='${this.date}', reason='${this.reason}', duration='${this.duration}', schedule='${this.schedule}', course='${this.course}', instructor='${this.instructor}', subject='${this.subject}')`;
    }

    get(key) {
        if (key === 'date') {
            return this.date;
        } else if (key === 'reason') {
            return this.reason;
        } else if (key === 'duration') {
            return this.duration;
        } else if (key === 'schedule') {
            return this.schedule;
        } else if (key === 'course') {
            return this.course;
        } else if (key === 'instructor') {
            return this.instructor;
        } else if (key === 'subject') {
            return this.subject;
        } else {
            throw new Error(`Invalid key: ${key}, valid keys are 'date', 'reason', 'duration', 'schedule', 'course', 'instructor', and 'subject'`);
        }
    }

    getDict(){
        let dict = {"date" : this.date, "reason": this.reason, "duration": this.duration, "schedule": this.schedule, "course": this.course, "instructor": this.instructor, "subject": this.subject};
        return dict;
    }
}

class AbsenceReport {
    constructor(nbAbsences, time, data) {
        this.nbAbsences = nbAbsences;
        this.time = time;
        this.data = data;
    }

    toString() {
        return `AbsenceReport(nbAbsences=${this.nbAbsences}, time=${this.time}, data=${this.data})`;
    }

    get(key) {
        if (key === 'nbAbsences') {
            return this.nbAbsences;
        } else if (key === 'time') {
            return this.time;
        } else if (key === 'data') {
            return this.data;
        } else {
            throw new Error(`Invalid key: ${key}, valid keys are 'nbAbsences', 'time', and 'data'`);
        }
    }

    getDict(){
        let dict = {"nbAbsences" : this.nbAbsences, "time": this.time, "data": []};
        for (let i = 0; i < this.data.length; i++) {
            dict["data"].push(this.data[i].getDict());
        }
        return dict;
    }
}


module.exports = {
    ClassMember: ClassMember,
    ClassMemberReport: ClassMemberReport,
    Grade: Grade,
    GradeReport: GradeReport,
    Absence: Absence,
    AbsenceReport: AbsenceReport
};
