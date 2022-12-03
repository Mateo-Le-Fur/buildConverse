const { parentPort, workerData, threadId } = require("worker_threads");
const sharp = require("sharp");
const path = require("path");

(async () => {
  parentPort.postMessage(await compress());
  parentPort.close();
})();

async function compress() {
  console.log("threadId: " + threadId);
  const buffer = await sharp(workerData.data.avatar)
    .resize(100, 100)
    .webp({
      quality: 80,
      effort: 0
    })
    .toFile(path.join(__dirname, `../images/${workerData.avatar_name}.webp`));

  return buffer;
}
