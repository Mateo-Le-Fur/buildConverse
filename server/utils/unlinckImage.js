const fs = require("fs");
const { defaultImage } = require("../images/default/defaultImage");
const path = require("path");

function unlinkImage(image) {

  let isDefault = false;
  defaultImage.forEach((img) => {
    if (`/images/${img}` === image) {
      isDefault = true;
    }
  });

  if (!isDefault) {
    fs.unlinkSync(path.join(__dirname, `..${image}`))
  }

}

module.exports = {
  unlinkImage
};