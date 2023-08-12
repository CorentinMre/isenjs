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

Here is an example script with login:

```js
const Client = require('isenjs');


// Create the client
const client = new Client("username", 
                          "password"
                         );

(async () => {
    try {

        await client.init();

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

Here is an example script without login (just classMember for now):

```js
const Client = require('isenjs'); // Assuming the package is available as 'isenjs'

// Create the client
const client = new Client();

client.classMember("CIR", "2", "Caen")
  .then(classMember => {
    console.log(classMember);
  })
  .catch(error => {
    console.error("An error occurred:", error);
  });
```

Here is an example script to get absences from webAurion:

```js
const Client = require('isenjs');


// Create the client
const client = new Client("username", 
                          "password"
                         );
(async () => {
    try {

        await client.init();

        if (!client.logged_in) {
            console.error("Login failed");
            return;
        }

        const webAurion = await client.webAurion();

        const absences = await webAurion.absences();
        console.log("Absences:", absences);


    } catch (error) {
        console.error("Error:", error);
    }
})();
```

Here is an example script to get grades from webAurion:

```js

...

(async () => {
    try {

        await client.init();

        if (!client.logged_in) {
            console.error("Login failed");
            return;
        }

        const webAurion = await client.webAurion();

        const grades = await webAurion.grades();
        console.log("Grades:", grades);


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
