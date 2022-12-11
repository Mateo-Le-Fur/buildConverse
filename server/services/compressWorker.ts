import { parentPort, workerData } from "worker_threads";
import sharp from "sharp";
import path from "path";

(async () => {
  parentPort?.postMessage(await compress());
  parentPort?.close();
})();

async function compress() {
  const buffer = await sharp(workerData.data.avatar)
    .resize(100, 100)
    .webp({
      quality: 80,
      effort: 0
    })
    .toFile(path.join(__dirname, `../images/${workerData.avatarName}.webp`));

  return buffer;
}

