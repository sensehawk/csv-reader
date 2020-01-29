const csvtojson = require("csvtojson");

const mapProps = props => {
  let raw_images = props["raw images"] || props["raw_images"];
  return {
    issueUID: props.issueUID,
    raw_images,
    folder_name: props["projectName"],
    markers: props["markers"],
    temp: props["temp"],
    timestamp: props["timestamp"]
  };
};

const csvToJson = async filePath => {
  const jsonArr = await csvtojson().fromFile(filePath);
  return jsonArr.map(props => mapProps(props));
};

const generateRawImages = (projectUID, images, imgExt = "jpg") => {
  let imagesArr = images["raw_images"] ? images["raw_images"].split(",") : [];
  let markersArr = images["markers"] ? images["markers"].split(";") : new Array(imagesArr.length).fill([0,0]);
  let rawImagesArr = [];
  
  for (i=0; i<imagesArr.length; i++) {
    let image = imagesArr[i].includes(".") ? imagesArr[i] : `${imagesArr[i]}.${imgExt}`;
    rawImagesArr.push({
      location: markersArr.length ? markersArr[i].split(",") : [0, 0],
      service: {
        name: "aws_s3",
        region: "ap-south-1",
        bucket: "sensehawk-mumbai",
        stage: "unity_core",
        key: images["folder_name"]
          ? `hawkai/${projectUID}/raw_images/${images["folder_name"]}/${image}`
          : `hawkai/${projectUID}/raw_images/${image}.${imgExt}`
      }
    });
  }
  return rawImagesArr;
};

module.exports = {
  generateRawImages,
  csvToJson
};
