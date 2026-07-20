import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanupJob, cleanupProcessingQueueEntries, recoverProcessingQueueOnStartup, shouldDeleteCompletedOutput, shouldExpireJob } from "./cleanup.js";
import { FileJobQueue } from "./file-queue.js";
import { FileJobStore } from "./job-store.js";
import { FileStorage } from "./storage.js";
import type { CloudJobRecord } from "./types.js";

function job(overrides: Partial<CloudJobRecord>): CloudJobRecord {
  const now = new Date("2026-07-18T00:00:00.000Z").toISOString();
  return {
    jobId: "job_test",
    tokenHash: "hash",
    toolType: "compress-pdf",
    compressionRequest: { mode: "preset", preset: "balanced" },
    state: "awaiting-upload",
    createdAt: now,
    updatedAt: now,
    expiresAt: now,
    inputExpiresAt: now,
    attemptCount: 0,
    cancellationRequested: false,
    deletion: { inputDeleted: false, outputDeleted: false, localFilesDeleted: false },
    ...overrides,
  };
}

describe("cleanup selection", () => {
  let tempRoot = "";
  let storage: FileStorage;
  let store: FileJobStore;
  let queue: FileJobQueue;

  beforeEach(async () => {
    tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "paperlane-cleanup-test-"));
    storage = new FileStorage(tempRoot);
    await storage.ensureReady();
    store = new FileJobStore(storage.jobsDir);
    await store.ensureReady();
    queue = new FileJobQueue(storage.queueDir, storage.processingQueueDir);
    await queue.ensureReady();
  });

  afterEach(async () => {
    await fs.rm(tempRoot, { recursive: true, force: true });
  });

  async function writeProcessingReceipt(jobId: string) {
    const receiptPath = path.join(storage.processingQueueDir, `1784431001320-${jobId}.json`);
    await fs.writeFile(receiptPath, JSON.stringify({ jobId, queuedAt: "2026-07-18T00:00:00.000Z" }));
    return receiptPath;
  }

  it("selects expired active jobs", () => {
    expect(shouldExpireJob(job({ state: "queued" }), new Date("2026-07-18T00:00:01.000Z"))).toBe(true);
  });

  it("selects expired completed outputs", () => {
    expect(
      shouldDeleteCompletedOutput(
        job({
          state: "complete",
          outputKey: "job_test/output.pdf",
          outputExpiresAt: "2026-07-18T00:00:00.000Z",
        }),
        new Date("2026-07-18T00:00:01.000Z"),
      ),
    ).toBe(true);
  });

  it("removes a stale queue-processing receipt for an expired job", async () => {
    const expired = job({ state: "expired" });
    await store.write(expired);
    const receiptPath = await writeProcessingReceipt(expired.jobId);

    await cleanupProcessingQueueEntries(queue, store, storage);

    await expect(fs.stat(receiptPath)).rejects.toThrow();
  });

  it("removes a stale queue-processing receipt for a cancelled job", async () => {
    const cancelled = job({ state: "cancelled" });
    await store.write(cancelled);
    const receiptPath = await writeProcessingReceipt(cancelled.jobId);

    await cleanupProcessingQueueEntries(queue, store, storage);

    await expect(fs.stat(receiptPath)).rejects.toThrow();
  });

  it("preserves cancelled state and marks local cleanup metadata", async () => {
    const cancelled = job({ state: "cancelled", inputKey: "job_test/input.pdf" });
    await storage.putInput("job_test/input.pdf", Buffer.from("%PDF-cancel"));
    await store.write(cancelled);

    const cleaned = await cleanupJob(cancelled, store, storage);

    expect(cleaned.state).toBe("cancelled");
    expect(cleaned.deletion).toEqual({ inputDeleted: true, outputDeleted: true, localFilesDeleted: true });
  });

  it("preserves an active queue-processing receipt during cleanup recovery", async () => {
    const active = job({
      state: "processing",
      expiresAt: "2026-07-18T00:10:00.000Z",
      inputKey: "job_test/input.pdf",
    });
    await store.write(active);
    const receiptPath = await writeProcessingReceipt(active.jobId);

    await cleanupProcessingQueueEntries(queue, store, storage, new Date("2026-07-18T00:00:01.000Z"));

    await expect(fs.stat(receiptPath)).resolves.toBeTruthy();
  });

  it("removes a queue-processing receipt when the linked job is missing", async () => {
    const receiptPath = await writeProcessingReceipt("job_missing");

    await cleanupProcessingQueueEntries(queue, store, storage);

    await expect(fs.stat(receiptPath)).rejects.toThrow();
  });

  it("requeues interrupted non-terminal queue-processing receipts on worker startup", async () => {
    const active = job({
      state: "processing",
      expiresAt: "2026-07-18T00:10:00.000Z",
      inputKey: "job_test/input.pdf",
      subStage: "generating-candidate",
      errorCategory: "INVALID_STATE",
    });
    await store.write(active);
    const receiptPath = await writeProcessingReceipt(active.jobId);

    await recoverProcessingQueueOnStartup(queue, store, storage, new Date("2026-07-18T00:00:01.000Z"));

    await expect(fs.stat(receiptPath)).rejects.toThrow();
    expect((await queue.listProcessingReceipts())).toHaveLength(0);
    expect((await fs.readdir(storage.queueDir)).filter((entry) => entry.endsWith(".json"))).toHaveLength(1);
    const recovered = await store.read(active.jobId);
    expect(recovered?.state).toBe("queued");
    expect(recovered).not.toHaveProperty("subStage");
    expect(recovered).not.toHaveProperty("errorCategory");
  });
});
