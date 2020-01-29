#!/usr/bin/env node
const fs = require("fs");
const [, , ...argsList] = process.argv; // short hand for -> const argsList = process.argv.slice(2);
const { platform } = require("process");
let projectUID = argsList[0];

const { promisify } = require("util");
const readFile = promisify(fs.readFile);

const helpMenu = () => 'command "./app.js [projectUID]"';
// const pUid = "DankFXAj0a";
// projectUID = pUid;
if(!projectUID) {
  console.log("Please provide projectUID!");
  console.log(helpMenu());
  process.exit();
}

const { csvToJson } = require("./helpers/index");
const result_path = `result_${projectUID}.json`;

const csvPath = platform === "win32" ? `.\files\csv\${projectUID}.csv` : `./files/csv/${projectUID}.csv`;
const jsonPath = platform === "win32" ? `.\files\features\${projectUID}.json`: `./files/features/${projectUID}.json`;
const { generateRawImages } = require("./helpers/index");


const getFeatures = async(path) => JSON.parse(await readFile(path));

function parseObject(object) {
  let jsonObj = {};
  for (const obj of object) {
    jsonObj[obj.issueUID] = {
      raw_images: obj["raw_images"],
      folder_name: obj["folder_name"],
      markers: obj["markers"],
      temperature: obj["temp"],
      timestamp: obj["timestamp"],
    };
  }
  return jsonObj;
}

csvToJson(csvPath)
  .then(async jA => {
    const features = await getFeatures(jsonPath);
    let jsonObj = parseObject(jA);
    for (let feature of features.features) {
      if (jsonObj[feature.properties.uid]) {
        feature.properties["raw_images"] = generateRawImages(feature.properties.projectUid, jsonObj[feature.properties.uid], "jpg");
        feature.properties["temperature_difference"] = jsonObj[feature.properties.uid].temperature;
        feature.properties["timestamp"] = jsonObj[feature.properties.uid].timestamp;
      }
    }
    fs.appendFileSync(result_path, JSON.stringify(features), { flag: "w+" });
    console.log(`data written to ${result_path}`);
  })
  .catch(console.log);
