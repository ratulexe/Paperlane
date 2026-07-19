import fs from "node:fs/promises";
import path from "node:path";
import { FileJobStore } from "../shared/job-store.js";
import { FileStorage } from "../shared/storage.js";
import { PublicApiError } from "../shared/errors.js";
import { calculateCompressionResult, calculateTargetCompressionResult, getPdfPageCount, validatePdfReadable } from "../shared/validation.js";
import { runGhostscript } from "./ghostscript.js";
import { defaultMaximumTargetAttempts, runTargetSizeSearch } from "./target-size-search.js";
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
    const originalPageCount = await getPdfPageCount(inputBytes);

    await store.update(jobId, (current) => ({ ...current, state: "processing" }));
    if (job.compressionRequest.mode === "preset") {
      await runGhostscript({
        binary: config.ghostscriptBinary,
        inputPath,
        outputPath,
        preset: job.compressionRequest.preset,
        timeoutMs: config.jobTimeoutMs,
        shouldCancel: async () => Boolean((await store.read(jobId))?.cancellationRequested),
      });
    } else {
      const searchStartedAt = Date.now();
      const maximumAttempts = defaultMaximumTargetAttempts;
      const targetBytes = job.compressionRequest.targetBytes;
      await store.update(jobId, (current) => ({
        ...current,
        subStage: "preparing-search",
        maximumAttempts,
      }));
      const search = await runTargetSizeSearch({
        binary: config.ghostscriptBinary,
        inputPath,
        targetBytes,
        originalPageCount,
        maximumAttempts,
        timeoutMs: config.jobTimeoutMs,
        tempDirectory: tempRoot,
        cancellationCheck: async () => Boolean((await store.read(jobId))?.cancellationRequested),
        onAttemptStart: async (attempt, maximum) => {
          await store.update(jobId, (current) => ({
            ...current,
            subStage: "generating-candidate",
            attemptsUsed: attempt,
            maximumAttempts: maximum,
            attemptCount: Math.max(current.attemptCount, attempt),
          }));
        },
        onCandidateValidated: async (attempt, candidate) => {
          await store.update(jobId, (current) => ({
            ...current,
            subStage: "comparing-result",
            attemptsUsed: attempt,
            smallestCandidateBytes: current.smallestCandidateBytes
              ? Math.min(current.smallestCandidateBytes, candidate.outputBytes)
              : candidate.outputBytes,
          }));
        },
      });
      await store.update(jobId, (current) => ({
        ...current,
        subStage: "selecting-best-output",
        attemptsUsed: search.attemptsUsed,
        targetMet: search.targetMet,
        smallestCandidateBytes: search.smallestCandidate.outputBytes,
        selectedCandidateBytes: search.selectedCandidate.outputBytes,
        candidateQualityLevel: search.selectedCandidate.settings.qualityLabel,
        candidateDpi: search.selectedCandidate.settings.dpi,
        targetDifferenceBytes: search.selectedCandidate.outputBytes - targetBytes,
        attemptCount: Math.max(current.attemptCount, search.attemptsUsed),
      }));
      await fs.copyFile(search.selectedCandidate.outputPath, outputPath);
      const elapsed = Date.now() - searchStartedAt;
      if (elapsed >= config.jobTimeoutMs) throw new PublicApiError("PROCESSING_TIMEOUT", "Target search timed out.", 504);
    }

    await store.update(jobId, (current) => ({ ...current, state: "validating-output", subStage: "finalising-output" }));
    const outputBytes = await assertPdfOutput(outputPath);
    const outputPageCount = await getPdfPageCount(await fs.readFile(outputPath));
    if (outputPageCount !== originalPageCount) {
      throw new PublicApiError("OUTPUT_PAGE_COUNT_MISMATCH", "Output page count mismatch.", 500);
    }
    const outputKey = storage.createOutputKey(jobId);
    await storage.putOutput(outputKey, outputPath);
    await storage.deleteInput(job.inputKey);

    const outputExpiresAt = new Date(Date.now() + config.outputRetentionMs).toISOString();
    const targetRequest = job.compressionRequest.mode === "target-size" ? job.compressionRequest : undefined;
    await store.update(jobId, (current) => ({
      ...current,
      state: "complete",
      outputKey,
      outputBytes,
      outputExpiresAt,
      expiresAt: outputExpiresAt,
      subStage: undefined,
      compression:
        targetRequest
          ? calculateTargetCompressionResult({
              originalBytes: job.originalBytes ?? inputBytes.length,
              outputBytes,
              targetBytes: targetRequest.targetBytes,
              targetMet: outputBytes <= targetRequest.targetBytes,
              attemptsUsed: current.attemptsUsed ?? current.attemptCount,
              qualityLabel: current.candidateQualityLevel ?? "Maximum practical compression",
              smallestCandidateBytes: current.smallestCandidateBytes ?? outputBytes,
            })
          : calculateCompressionResult(job.originalBytes ?? inputBytes.length, outputBytes),
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
