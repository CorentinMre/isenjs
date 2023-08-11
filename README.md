<br>
<p align="center"><img width="400" alt="Logo" src="https://raw.githubusercontent.com/CorentinMre/isenjs/main/images/icon.jpg"></a></p>

<br/>

<h2 style="font-family: sans-serif; font-weight: normal;" align="center"><strong>An API for ISEN-OUEST</strong></h2>

<br/>

<h2 style="font-family: sans-serif; font-weight: normal;" align="center"><strong>⚠️ Unofficial !!</strong></h2>

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

//check if logged in
client.logged_in.then((logged_in) => {
    console.log(logged_in);
});
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
