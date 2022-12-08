const { defaultImage } = require("../images/default/defaultImage");
function getRandomImage() {
  const random = Math.floor(Math.random() * defaultImage.length);

  return defaultImage[random];
}

export { getRandomImage, defaultImage };
