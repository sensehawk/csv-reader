const csvtojson = require("csvtojson");

const mapProps = (props) => {
  return {
    issueUID: props.issueUID,
    raw_images: props["raw images"],
    folder_name: props["projectName"]
  }
}

const csvToJson = async filePath => {
  const jsonArr = await csvtojson().fromFile(filePath);
  return jsonArr.map(props => mapProps(props));
};

const generateRawImages = (projectUID, images, imgExt = "jpg") => {
  let imagesArr = images["raw_images"].split(",");
  let rawImagesArr = [];
  for (image of imagesArr)
    rawImagesArr.push({
      location: [0, 0],
      service: {
        name: "aws_s3",
        region: "ap-south-1",
        bucket: "sensehawk-mumbai",
        stage: "unity_core",
        key: `hawkai/${projectUID}/raw_images/${images["folder_name"]}/${image}.${imgExt}`
      }
    });
  return rawImagesArr;
};

module.exports = {
  generateRawImages,
  csvToJson
};
