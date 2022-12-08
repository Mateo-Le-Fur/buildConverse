import { Worker } from "worker_threads";

function runService(path: string, workerData) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path, {
      workerData,
    });

    worker.on("message", resolve);

    worker.on("error", reject);

    worker.on("exit", (code) => {
      if (code !== 0) reject(new Error(`stopped with  ${code} exit code`));
    });
  });
}

export default runService;
