import fs from "node:fs/promises";
import path from "node:path";
import { FileJobStore } from "../shared/job-store.js";
import { FileStorage } from "../shared/storage.js";
import { PublicApiError } from "../shared/errors.js";
import { calculateCompressionResult, validatePdfReadable } from "../shared/validation.js";
import { runGhostscript } from "./ghostscript.js";
import type { ServerConfig } from "../shared/config.js";

async function assertPdfOutput(filePath: string) {
  const bytes = await fs.readFile(filePath);
  if (!bytes.length) throw new PublicApiError("OUTPUT_INVALID", "Empty output.", 500);
  if (!bytes.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
    throw new PublicApiError("OUTPUT_INVALID", "Output is not a PDF.", 500);
  }
  await validatePdfReadable(bytes);
  return bytes.length;
}

export async function processCompressionJob(jobId: string, store: FileJobStore, storage: FileStorage, config: ServerConfig) {
  const job = await store.read(jobId);
  if (!job || job.toolType !== "compress-pdf") return;
  if (!job.inputKey || !job.originalBytes) {
    await store.update(jobId, (current) => ({ ...current, state: "failed", errorCategory: "UPLOAD_FAILED" }));
    return;
  }
  if (job.cancellationRequested) {
    await store.update(jobId, (current) => ({ ...current, state: "cancelled" }));
    return;
  }

  const tempBase = process.env.PAPERLANE_WORKER_TMP_DIR ?? path.join(process.cwd(), "tmp");
  await fs.mkdir(tempBase, { recursive: true });
  const tempRoot = await fs.mkdtemp(path.join(await fs.realpath(tempBase), "paperlane-job-"));
  const inputPath = path.join(tempRoot, "input.pdf");
  const outputPath = path.join(tempRoot, "output.pdf");

  try {
    await store.update(jobId, (current) => ({
      ...current,
      state: "validating",
      attemptCount: current.attemptCount + 1,
    }));

    await fs.copyFile(storage.inputPath(job.inputKey), inputPath);
    const inputBytes = await fs.readFile(inputPath);
    await validatePdfReadable(inputBytes);

    await store.update(jobId, (current) => ({ ...current, state: "processing" }));
    await runGhostscript({
      binary: config.ghostscriptBinary,
      inputPath,
      outputPath,
      preset: job.preset,
      timeoutMs: config.jobTimeoutMs,
      shouldCancel: async () => Boolean((await store.read(jobId))?.cancellationRequested),
    });

    await store.update(jobId, (current) => ({ ...current, state: "validating-output" }));
    const outputBytes = await assertPdfOutput(outputPath);
    const outputKey = storage.createOutputKey(jobId);
    await storage.putOutput(outputKey, outputPath);
    await storage.deleteInput(job.inputKey);

    const outputExpiresAt = new Date(Date.now() + config.outputRetentionMs).toISOString();
    await store.update(jobId, (current) => ({
      ...current,
      state: "complete",
      outputKey,
      outputBytes,
      outputExpiresAt,
      expiresAt: outputExpiresAt,
      compression: calculateCompressionResult(job.originalBytes ?? inputBytes.length, outputBytes),
      deletion: { ...current.deletion, inputDeleted: true, localFilesDeleted: true },
    }));
  } catch (error) {
    const category = error instanceof PublicApiError ? error.category : "COMPRESSION_FAILED";
    await store.update(jobId, (current) => ({
      ...current,
      state: current.cancellationRequested ? "cancelled" : "failed",
      errorCategory: category,
      deletion: { ...current.deletion, localFilesDeleted: true },
    }));
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
}
