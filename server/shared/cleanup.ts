import { FileJobStore } from "./job-store.js";
import { FileStorage } from "./storage.js";
import type { CloudJobRecord } from "./types.js";

export function shouldExpireJob(job: CloudJobRecord, now = new Date()) {
  return new Date(job.expiresAt) <= now && job.state !== "expired" && job.state !== "cancelled";
}

export function shouldDeleteCompletedOutput(job: CloudJobRecord, now = new Date()) {
  return Boolean(job.outputKey && job.outputExpiresAt && new Date(job.outputExpiresAt) <= now && !job.deletion.outputDeleted);
}

export async function cleanupJob(job: CloudJobRecord, store: FileJobStore, storage: FileStorage) {
  const next = { ...job, deletion: { ...job.deletion } };
  await storage.deleteInput(next.inputKey);
  next.deletion.inputDeleted = true;
  if (next.state !== "complete" || shouldDeleteCompletedOutput(next)) {
    await storage.deleteOutput(next.outputKey);
    next.deletion.outputDeleted = true;
  }
  next.state = next.state === "complete" && !next.deletion.outputDeleted ? next.state : "expired";
  next.updatedAt = new Date().toISOString();
  await store.write(next);
  return next;
}
