import { loadServerConfig } from "../shared/config.js";
import { FileJobQueue } from "../shared/file-queue.js";
import { FileJobStore } from "../shared/job-store.js";
import { FileStorage } from "../shared/storage.js";
import { processCompressionJob } from "./process-compression.js";

const config = loadServerConfig();
const storage = new FileStorage(config.storageRoot);
await storage.ensureReady();
const store = new FileJobStore(storage.jobsDir);
await store.ensureReady();
const queue = new FileJobQueue(storage.queueDir, storage.processingQueueDir);
await queue.ensureReady();

let shuttingDown = false;
process.on("SIGTERM", () => {
  shuttingDown = true;
});
process.on("SIGINT", () => {
  shuttingDown = true;
});

console.log(JSON.stringify({ level: "info", service: "paperlane-worker", concurrency: config.workerConcurrency }));

while (!shuttingDown) {
  const claimed = await queue.claimNext();
  if (!claimed) {
    await new Promise((resolve) => setTimeout(resolve, config.workerPollMs));
    continue;
  }
  await processCompressionJob(claimed.jobId, store, storage, config);
  await queue.acknowledge(claimed.receiptPath);
}
