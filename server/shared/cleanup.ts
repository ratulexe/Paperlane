import { FileJobQueue } from "./file-queue.js";
import { FileJobStore } from "./job-store.js";
import { FileStorage } from "./storage.js";
import type { CloudJobRecord, CloudJobState } from "./types.js";

export const terminalJobStates = new Set<CloudJobState>(["complete", "failed", "expired", "cancelled", "deleted"]);

export function isTerminalJobState(state: CloudJobState) {
  return terminalJobStates.has(state);
}

export function shouldExpireJob(job: CloudJobRecord, now = new Date()) {
  return new Date(job.expiresAt) <= now && !isTerminalJobState(job.state);
}

export function shouldDeleteCompletedOutput(job: CloudJobRecord, now = new Date()) {
  return Boolean(job.outputKey && job.outputExpiresAt && new Date(job.outputExpiresAt) <= now && !job.deletion.outputDeleted);
}

export async function cleanupJob(job: CloudJobRecord, store: FileJobStore, storage: FileStorage) {
  const next = { ...job, deletion: { ...job.deletion } };
  await storage.deleteInput(next.inputKey);
  next.deletion.inputDeleted = true;
  next.deletion.localFilesDeleted = true;
  if (next.state !== "complete" || shouldDeleteCompletedOutput(next)) {
    await storage.deleteOutput(next.outputKey);
    next.deletion.outputDeleted = true;
  }
  if (!(next.state === "complete" && !next.deletion.outputDeleted) && next.state !== "cancelled" && next.state !== "deleted") {
    next.state = "expired";
  }
  next.updatedAt = new Date().toISOString();
  await store.write(next);
  return next;
}

export async function cleanupProcessingQueueEntries(queue: FileJobQueue, store: FileJobStore, storage?: FileStorage, now = new Date()) {
  const receipts = await queue.listProcessingReceipts();

  await Promise.all(
    receipts.map(async (receipt) => {
      const job = await store.read(receipt.jobId);
      if (!job) {
        await queue.removeProcessingReceipt(receipt.receiptPath);
        return;
      }
      if (shouldExpireJob(job, now)) {
        if (storage) await cleanupJob(job, store, storage);
        await queue.removeProcessingReceipt(receipt.receiptPath);
        return;
      }
      if (isTerminalJobState(job.state)) {
        await queue.removeProcessingReceipt(receipt.receiptPath);
      }
    }),
  );
}

export async function recoverProcessingQueueOnStartup(queue: FileJobQueue, store: FileJobStore, storage: FileStorage, now = new Date()) {
  const receipts = await queue.listProcessingReceipts();

  await Promise.all(
    receipts.map(async (receipt) => {
      const job = await store.read(receipt.jobId);
      if (!job) {
        await queue.removeProcessingReceipt(receipt.receiptPath);
        return;
      }
      if (shouldExpireJob(job, now)) {
        await cleanupJob(job, store, storage);
        await queue.removeProcessingReceipt(receipt.receiptPath);
        return;
      }
      if (isTerminalJobState(job.state)) {
        await queue.removeProcessingReceipt(receipt.receiptPath);
        return;
      }
      if (!job.inputKey) {
        await queue.removeProcessingReceipt(receipt.receiptPath);
        return;
      }
      if (!isTerminalJobState(job.state)) {
        await store.update(job.jobId, (current) => ({
          ...current,
          state: "queued",
          subStage: undefined,
          errorCategory: undefined,
        }));
        await queue.requeueProcessingReceipt(receipt.receiptPath, job.jobId);
      }
    }),
  );
}
