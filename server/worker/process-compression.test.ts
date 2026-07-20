import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FileJobStore } from "../shared/job-store.js";
import { FileStorage } from "../shared/storage.js";
import type { ServerConfig } from "../shared/config.js";
import type { CloudJobRecord } from "../shared/types.js";
import { processCompressionJob } from "./process-compression.js";

function job(overrides: Partial<CloudJobRecord>): CloudJobRecord {
  const now = new Date("2026-07-18T00:00:00.000Z").toISOString();
  return {
    jobId: "job_cancel_test",
    tokenHash: "hash",
    toolType: "compress-pdf",
    compressionRequest: { mode: "preset", preset: "balanced" },
    state: "queued",
    createdAt: now,
    updatedAt: now,
    expiresAt: "2026-07-18T00:30:00.000Z",
    inputExpiresAt: "2026-07-18T00:30:00.000Z",
    attemptCount: 0,
    cancellationRequested: false,
    deletion: { inputDeleted: false, outputDeleted: false, localFilesDeleted: false },
    ...overrides,
  };
}

function config(storageRoot: string): ServerConfig {
  return {
    apiPort: 8787,
    allowedOrigins: ["http://localhost:5173"],
    storageRoot,
    maxUploadBytes: 25 * 1024 * 1024,
    jobTimeoutMs: 5_000,
    inputRetentionMs: 30 * 60_000,
    outputRetentionMs: 30 * 60_000,
    rateLimitWindowMs: 60_000,
    rateLimitMaxJobs: 8,
    rateLimitMaxUploads: 16,
    workerConcurrency: 1,
    workerPollMs: 1_500,
    ghostscriptBinary: "gs",
    production: false,
  };
}

describe("compression cancellation cleanup", () => {
  let tempRoot = "";
  let storage: FileStorage;
  let store: FileJobStore;

  beforeEach(async () => {
    tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "paperlane-worker-test-"));
    storage = new FileStorage(tempRoot);
    await storage.ensureReady();
    store = new FileJobStore(storage.jobsDir);
    await store.ensureReady();
  });

  afterEach(async () => {
    await fs.rm(tempRoot, { recursive: true, force: true });
  });

  it("does not leave INVALID_STATE on normally cancelled jobs", async () => {
    const inputKey = "job_cancel_test/input.pdf";
    const outputKey = "job_cancel_test/output.pdf";
    await storage.putInput(inputKey, Buffer.from("%PDF-cancelled-test"));
    await fs.mkdir(path.dirname(storage.outputPath(outputKey)), { recursive: true });
    await fs.writeFile(storage.outputPath(outputKey), Buffer.from("%PDF-output"));
    await store.write(
      job({
        inputKey,
        outputKey,
        originalBytes: 20,
        state: "processing",
        cancellationRequested: true,
        errorCategory: "INVALID_STATE",
      }),
    );

    await processCompressionJob("job_cancel_test", store, storage, config(tempRoot));

    const updated = await store.read("job_cancel_test");
    expect(updated?.state).toBe("cancelled");
    expect(updated).not.toHaveProperty("errorCategory");
    expect(updated?.deletion).toEqual({ inputDeleted: true, outputDeleted: true, localFilesDeleted: true });
    await expect(fs.stat(storage.inputPath(inputKey))).rejects.toThrow();
    await expect(fs.stat(storage.outputPath(outputKey))).rejects.toThrow();
  });
});
