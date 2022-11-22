const sharp = require("sharp");
const path = require("path");

async function compressImage(buffer, imageName, size) {
  await sharp(buffer)
    .resize(size, size)
    .webp({
      quality: 80,
    })
    .toFile(path.join(__dirname, "../images", `${imageName}.webp`));
}

module.exports = compressImage;
