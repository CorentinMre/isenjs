<br>
<p align="center"><img width="400" alt="Logo" src="https://raw.githubusercontent.com/CorentinMre/isenjs/main/images/icon.jpg"></a></p>

<br/>

<h2 style="font-family: sans-serif; font-weight: normal;" align="center"><strong>An API for ISEN-OUEST</strong></h2>

<br/>

<h2 style="font-family: sans-serif; font-weight: normal;" align="center"><strong>⚠️ Unofficial !!</strong></h2>

[![npm version](https://img.shields.io/npm/v/isenjs.svg?style=flat-square)](https://www.npmjs.org/package/isenjs)
[![install size](https://img.shields.io/badge/dynamic/json?url=https://packagephobia.com/v2/api.json?p=isenjs&query=$.install.pretty&label=install%20size&style=flat-square)](https://www.npmjs.org/package/isenjs)


## Description

A Nodejs API wrapper for ISEN-OUEST, with webAurion information like calendar, grades, absences...

## Usage

- `npm install isenjs`

## Here is an example script with login:

```js
const { WebAurion } = require('isenjs');


// Create the client
const client = new WebAurion();

(async () => {
    try {

        await client.login("<username>",
                          "<password>");

        
        if (!client.logged_in) {
            console.error("Login failed");
            return;
        }

        // Get User Info
        const userInfo = await client.userInfo();
        console.log("User Info:", userInfo);

    } catch (error) {
        console.error("Error:", error);
    }
})();
```

## Here is an example script to get absences from webAurion:

```js
const { WebAurion } = require('isenjs'); // don't forget to import WebAurion

const client = new WebAurion();

(async () => {
    try {

        await client.login("<username>",
                          "<password>");

        if (!clientlogged_in) {
            console.error("Login failed");
            return;
        }

        const absences = await client.getAbsences();
        console.log(absences);
        // console.log(absences.toJSON()); // to have the Object


    } catch (error) {
        console.error("Error:", error);
    }
})();
```

## Here is an example script to get grades from webAurion:

```js

const { WebAurion } = require('isenjs'); // don't forget to import WebAurion

const client = new WebAurion();


(async () => {
    try {

        await client.login("<username>",
                          "<password>");

        
        if (!client.logged_in) {
            console.error("Login failed");
            return;
        }

        const grades = await client.getGrades();
        console.log(grades);
        // console.log(grades.toJSON()); // to have the Object


    } catch (error) {
        console.error("Error:", error);
    }
})();
```

## Here is an example to get planning from webAurion

```js

const { WebAurion } = require('isenjs'); // don't forget to import WebAurion

const client = new WebAurion();

(async () => {
    try {

        await client.login("<username>",
                          "<password>");

        
        if (!client.logged_in) {
            console.error("Login failed");
            return;
        }

        const planning = await client.getPlanning();

        console.log(planning);
        //console.log(planning.toJSON()); // to have the Object


    } catch (error) {
        console.error("Error:", error);
    }
})();
```


## Example for get your school report

```js

const { WebAurion } = require('isenjs'); // don't forget to import WebAurion

const client = new WebAurion();

(async () => {
    try {

        await client.login("<username>",
                          "<password>");

        
        if (!client.logged_in) {
            console.error("Login failed");
            return;
        }

        const schoolReport = await client.getSchoolReport();

        console.log(schoolReport);
        //console.log(schoolReport.toJSON()); // to have the Object


    } catch (error) {
        console.error("Error:", error);
    }
})();
```

## Example for download your school report

```js

const { WebAurion } = require('isenjs'); // don't forget to import WebAurion

const client = new WebAurion();

(async () => {
    try {

        await client.login("<username>",
                          "<password>");

        if (!client.logged_in) {
            console.error("Login failed");
            return;
        }

        await client.downloadReport() // Download all your school report with the default name

        // if you want only one report

        // client.downloadReport(null, "report_id")
        // Download the report with the id "report_id" with the default name (you have the id with the schoolReport object Ex. schoolReport = webAurion.getSchoolReport() )


    } catch (error) {
        console.error("Error:", error);
    }
})();
```

## LICENSE

Copyright (c) 2023 CorentinMre

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
