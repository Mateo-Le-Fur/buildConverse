import sharp from "sharp";
import path from "path";

async function compressImage(buffer: Buffer, imageName: string, size: number) {
  await sharp(buffer)
    .resize(size, size)
    .webp({
      quality: 80,
    })
    .toFile(path.join(__dirname, "../images", `${imageName}.webp`));
}

export default compressImage;
