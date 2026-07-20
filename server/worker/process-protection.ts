import fs from "node:fs/promises";
import path from "node:path";
import { FileJobStore } from "../shared/job-store.js";
import { FileStorage } from "../shared/storage.js";
import { PublicApiError } from "../shared/errors.js";
import { getPdfPageCount, validatePdfReadable } from "../shared/validation.js";
import { runProtectPdf } from "./ghostscript.js";
import type { ServerConfig } from "../shared/config.js";

async function assertProtectedPdfOutput(filePath: string) {
  const bytes = await fs.readFile(filePath);
  if (!bytes.length) throw new PublicApiError("OUTPUT_INVALID", "Empty output.", 500);
  if (!bytes.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
    throw new PublicApiError("OUTPUT_INVALID", "Output is not a PDF.", 500);
  }
  return bytes.length;
}

export async function processProtectionJob(jobId: string, store: FileJobStore, storage: FileStorage, config: ServerConfig) {
  const job = await store.read(jobId);
  if (!job || job.toolType !== "protect-pdf") return;
  if (!job.inputKey || !job.originalBytes || !job.protectionRequest) {
    await store.update(jobId, (current) => ({
      ...current,
      state: "failed",
      protectionRequest: undefined,
      errorCategory: "UPLOAD_FAILED",
    }));
    return;
  }
  if (job.cancellationRequested) {
    await storage.deleteInput(job.inputKey);
    await storage.deleteOutput(job.outputKey);
    await store.update(jobId, (current) => ({
      ...current,
      state: "cancelled",
      subStage: undefined,
      protectionRequest: undefined,
      errorCategory: undefined,
      deletion: { ...current.deletion, inputDeleted: true, outputDeleted: true, localFilesDeleted: true },
    }));
    return;
  }

  const tempBase = process.env.PAPERLANE_WORKER_TMP_DIR ?? path.join(process.cwd(), "tmp");
  await fs.mkdir(tempBase, { recursive: true });
  const tempRoot = await fs.mkdtemp(path.join(await fs.realpath(tempBase), "paperlane-protect-job-"));
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
    const originalPageCount = await getPdfPageCount(inputBytes);

    await store.update(jobId, (current) => ({ ...current, state: "processing", subStage: "applying-password" }));
    await runProtectPdf({
      binary: config.ghostscriptBinary,
      inputPath,
      outputPath,
      userPassword: job.protectionRequest.userPassword,
      ownerPassword: job.protectionRequest.ownerPassword,
      timeoutMs: config.jobTimeoutMs,
      shouldCancel: async () => Boolean((await store.read(jobId))?.cancellationRequested),
    });

    await store.update(jobId, (current) => ({ ...current, state: "validating-output", subStage: "validating-protected-output" }));
    const outputBytes = await assertProtectedPdfOutput(outputPath);
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
      subStage: undefined,
      protectionRequest: undefined,
      protection: {
        originalBytes: job.originalBytes ?? inputBytes.length,
        outputBytes,
        pageCount: originalPageCount,
        passwordApplied: true,
      },
      deletion: { ...current.deletion, inputDeleted: true, localFilesDeleted: true },
    }));
  } catch (error) {
    const category = error instanceof PublicApiError ? error.category : "PROTECTION_FAILED";
    const latest = (await store.read(jobId)) ?? job;
    const cancelled = latest.cancellationRequested || category === "CANCELLED";
    await storage.deleteInput(latest.inputKey);
    await storage.deleteOutput(latest.outputKey);
    await store.update(jobId, (current) => ({
      ...current,
      state: cancelled ? "cancelled" : "failed",
      subStage: undefined,
      protectionRequest: undefined,
      errorCategory: cancelled ? undefined : category,
      deletion: {
        ...current.deletion,
        inputDeleted: true,
        outputDeleted: true,
        localFilesDeleted: true,
      },
    }));
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
}
