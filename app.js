#!/usr/bin/env node
const fs = require("fs");
const [, , ...argsList] = process.argv; // short hand for -> const argsList = process.argv.slice(2);
const projectUID = argsList[0];

const helpMenu = () => 'command "./app.js [projectUID]"';
// const pUid = "DankFXAj0a";
if(!projectUID) {
  console.log("Please provide projectUID!");
  console.log(helpMenu());
  process.exit();
}

const { csvToJson } = require("./helpers/index");
const result_path = `result_${projectUID}.json`;

const csvPath = `./files/csv/${projectUID}.csv`;
const jsonPath = `./files/features/${projectUID}.js`;

const features = require(jsonPath);
const { generateRawImages } = require("./helpers/index");


function parseObject(object) {
  let jsonObj = {};
  for (const obj of object) {
    jsonObj[obj.issueUID] = {
      raw_images: obj["raw_images"],
      folder_name: obj["folder_name"],
      markers: obj["markers"]
    };
  }
  return jsonObj;
}

csvToJson(csvPath)
  .then(jA => {
    let jsonObj = parseObject(jA);
    for (let feature of features.features) {
      if (jsonObj[feature.properties.uid])
        feature.properties["raw_images"] = generateRawImages(feature.properties.projectUid, jsonObj[feature.properties.uid], "jpg");
    }
    fs.appendFileSync(result_path, JSON.stringify(features), { flag: "w+" });
    console.log(`data written to ${result_path}`)
  })
  .catch(console.log);
