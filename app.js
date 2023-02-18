"use strict";
/* *******************************************************
    - student1 : sobhi shehab
    - student2 : omar taha
    - class : 47/2
  ********************************************************
*/

// import node core modules.
const fs = require("fs");
const path = require("path");
const http = require("http");

// reading the User register information.
const userData = fs.readFileSync(
  path.join(__dirname + "/templates/database/UserData.txt"),
  "utf-8"
);

// function that takes form data and makes an object and returns it
function convertFromDataToObject(data) {
  let obj = {};
  const arr = data.toString().split("&");
  const str = JSON.stringify(arr);
  const filteredArr = JSON.parse(str.split("="));
  console.log(filteredArr);
  for (let i in filteredArr) {
    obj[`${filteredArr[i].split(",")[0]}`] = filteredArr[i].split(",")[1]; // creating the json object from key, value.
  }
  return obj;
}

// function that takes a username and password and checks if they exist in the register details file.
function isUserRegistered(userName, password) {
  const arr = userData.split("\r\n");

  // checking the given username and password match any of the already existing user.
  for (let i in arr) {
    if (
      arr[i].split(" ")[0].trim() === userName &&
      arr[i].split(" ")[1].trim() === password
    ) {
      return true;
    }
  }
  return false;
}

// creating a server.
const server = http.createServer((req, res) => {
  let pathName = req.url;

  // function that sets the type of the file from the url and sends it to the frontend
  function sendFile(mime) {
    let filePath = `${__dirname}${pathName}`;
    if (mime === "text/html") filePath = `${__dirname}/templates/${pathName}`;

    const file = fs.readFileSync(filePath);
    res.setHeader("content-type", mime);
    res.end(file);
  }

  if (pathName === "/") {
    pathName = "/login.html";
  }

  if (/\.html/.test(pathName)) {
    console.log(pathName);
    return sendFile("text/html");
  }
  if (/\.json$/.test(pathName)) {
    return sendFile("application/json");
  }
  if (/\.css$/.test(pathName)) {
    return sendFile("text/css");
  }

  if (/\.js$/.test(pathName)) {
    sendFile("text/javascript");
    return;
  }
  if (/\.jpg$/.test(pathName)) {
    return sendFile("image/jpeg");
  }
  if (/\.png$/.test(pathName)) {
    return sendFile("image/png");
  }
  if (/\.gif$/.test(pathName)) {
    return sendFile("image/gif");
  }

  // handling the login request and sending an answer to the frontend.
  if (pathName === "/login" && req.method === "POST") {
    const body = [];
    req.on("data", (chunks) => {
      body.push(chunks);
    });
    req.on("end", () => {
      const parsedData = Buffer.concat(body);
      const data = JSON.parse(parsedData);
      const answer = {
        valid: isUserRegistered(data["username"], data["password"]),
      };
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(answer));
    });
  }

  // handling the add car request and adding the inputted car info to the database and sending a new object to the frontend.
  if (pathName === "/addcar" && req.method === "POST") {
    const body = [];
    req.on("data", (chunks) => {
      body.push(chunks);
    });

    req.on("end", () => {
      const formDataObj = convertFromDataToObject(body);
      // replacing the image name with the full path to the image so we can display it.
      const absoluteImagePath =
        "/Images/AddedCarsImages/" + formDataObj["Image"];
      // adding a shekel symbol to the price.
      formDataObj["RentalPrice"] = "₪" + formDataObj["RentalPrice"];
      formDataObj["Image"] = absoluteImagePath;
      fs.readFile(
        __dirname + "/templates/database/list.json",
        "utf8",
        function (err, jsondata) {
          if (err) return console.log(err);
          var obj = JSON.parse(jsondata);
          obj.push(formDataObj);
          var strData = JSON.stringify(obj);
          fs.writeFile(
            __dirname + "/templates/database/list.json",
            strData,
            function (err) {
              if (err) return console.log(err);
            }
          );

          // redirecting to the same page after saving the new data.
          res.writeHead(302, { location: `addcar.html` });
          res.end();
        }
      );
    });
  }
  if (req.method === "POST" && req.url === "/deletecar") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const data = JSON.parse(body);
      console.log("Received car plate number:", data.carPlateNumber);

      fs.readFile(
        __dirname + "/templates/database/list.json",
        "utf-8",
        function (err, jsondata) {
          if(err) console.log(err)
          let cars = JSON.parse(jsondata); // convert to json.
          cars = cars.filter((car) => car.PlatesNumber !== data.carPlateNumber); // Remove the car with the specified plates number
          fs.writeFile(
            __dirname + "/templates/database/list.json",
            JSON.stringify(cars),
            function (err) {
              if (err) return console.log(err);
            }
          );
          // redirecting to the same page after saving the new data.
           res.writeHead(200, { "Content-Type": "text/plain" });
          res.end();
        } 
      );
    });
  }
});

// defining the port to listen on.
let port = 3000;

server.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
