export class ClassMember {
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
}

export class ClassMemberReport {
    constructor(nbMembers, data = []) {
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
}
