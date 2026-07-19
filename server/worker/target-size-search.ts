import fs from "node:fs/promises";
import path from "node:path";
import { PublicApiError } from "../shared/errors.js";
import { getPdfPageCount } from "../shared/validation.js";
import { buildTargetGhostscriptArgs, runGhostscriptWithArgs } from "./ghostscript.js";

export type CompressionCandidateSettings = {
  dpi: number;
  jpegQuality: number;
  qualityLabel: string;
};

export type CompressionCandidateResult = {
  settings: CompressionCandidateSettings;
  outputPath: string;
  outputBytes: number;
  valid: boolean;
};

export type TargetSearchInput = {
  binary: string;
  inputPath: string;
  targetBytes: number;
  originalPageCount: number;
  maximumAttempts: number;
  timeoutMs: number;
  tempDirectory: string;
  cancellationCheck: () => Promise<boolean> | boolean;
  onAttemptStart?: (attempt: number, maximumAttempts: number, settings: CompressionCandidateSettings) => Promise<void> | void;
  onCandidateValidated?: (attempt: number, candidate: CompressionCandidateResult) => Promise<void> | void;
};

export type TargetSearchResult = {
  targetMet: boolean;
  selectedCandidate: CompressionCandidateResult;
  smallestCandidate: CompressionCandidateResult;
  attemptsUsed: number;
};

export const defaultMaximumTargetAttempts = 14;
export const targetToleranceRatio = 0.03;

export function createCandidateSettings(maximumAttempts = defaultMaximumTargetAttempts): CompressionCandidateSettings[] {
  const settings: CompressionCandidateSettings[] = [
    { dpi: 150, jpegQuality: 90, qualityLabel: "Light compression" },
    { dpi: 120, jpegQuality: 88, qualityLabel: "Light compression" },
    { dpi: 100, jpegQuality: 85, qualityLabel: "Moderate compression" },
    { dpi: 85, jpegQuality: 82, qualityLabel: "Moderate compression" },
    { dpi: 72, jpegQuality: 78, qualityLabel: "Moderate compression" },
    { dpi: 60, jpegQuality: 72, qualityLabel: "Strong compression" },
    { dpi: 50, jpegQuality: 68, qualityLabel: "Strong compression" },
    { dpi: 50, jpegQuality: 60, qualityLabel: "Strong compression" },
    { dpi: 50, jpegQuality: 52, qualityLabel: "Strong compression" },
    { dpi: 50, jpegQuality: 45, qualityLabel: "Maximum practical compression" },
    { dpi: 50, jpegQuality: 38, qualityLabel: "Maximum practical compression" },
    { dpi: 50, jpegQuality: 32, qualityLabel: "Maximum practical compression" },
    { dpi: 50, jpegQuality: 28, qualityLabel: "Maximum practical compression" },
    { dpi: 50, jpegQuality: 25, qualityLabel: "Maximum practical compression" },
  ];

  return settings.slice(0, Math.max(1, Math.min(maximumAttempts, settings.length)));
}

export function selectBestCandidate(candidates: CompressionCandidateResult[], targetBytes: number) {
  const validCandidates = candidates.filter((candidate) => candidate.valid);
  if (!validCandidates.length) throw new PublicApiError("OUTPUT_INVALID", "No valid compression candidate.", 500);

  const smallestCandidate = [...validCandidates].sort((a, b) => a.outputBytes - b.outputBytes)[0];
  const underTarget = validCandidates
    .filter((candidate) => candidate.outputBytes <= targetBytes)
    .sort((a, b) => b.outputBytes - a.outputBytes);

  return {
    targetMet: underTarget.length > 0,
    selectedCandidate: underTarget[0] ?? smallestCandidate,
    smallestCandidate,
  };
}

export function isWithinTargetTolerance(outputBytes: number, targetBytes: number) {
  return outputBytes <= targetBytes && outputBytes >= targetBytes * (1 - targetToleranceRatio);
}

async function validateCandidate(filePath: string, originalPageCount: number) {
  const bytes = await fs.readFile(filePath);
  if (!bytes.length) throw new PublicApiError("OUTPUT_INVALID", "Empty candidate.", 500);
  if (!bytes.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
    throw new PublicApiError("OUTPUT_INVALID", "Candidate is not a PDF.", 500);
  }
  const pageCount = await getPdfPageCount(bytes);
  if (pageCount !== originalPageCount) {
    throw new PublicApiError("OUTPUT_PAGE_COUNT_MISMATCH", "Candidate page count mismatch.", 500);
  }
  return bytes.length;
}

async function assertNotCancelled(cancellationCheck: TargetSearchInput["cancellationCheck"]) {
  if (await cancellationCheck()) {
    throw new PublicApiError("INVALID_STATE", "Cancellation requested.", 409);
  }
}

export async function runTargetSizeSearch(input: TargetSearchInput): Promise<TargetSearchResult> {
  const startedAt = Date.now();
  const deadline = startedAt + input.timeoutMs;
  const candidates: CompressionCandidateResult[] = [];
  let pageCountMismatchCount = 0;

  await fs.mkdir(input.tempDirectory, { recursive: true });

  const settingsList = createCandidateSettings(input.maximumAttempts);

  for (const [index, settings] of settingsList.entries()) {
    await assertNotCancelled(input.cancellationCheck);
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) throw new PublicApiError("PROCESSING_TIMEOUT", "Target search timed out.", 504);

    const outputPath = path.join(input.tempDirectory, `candidate-${String(index + 1).padStart(2, "0")}.pdf`);
    try {
      await input.onAttemptStart?.(index + 1, settingsList.length, settings);
      await runGhostscriptWithArgs({
        binary: input.binary,
        args: buildTargetGhostscriptArgs(input.inputPath, outputPath, settings),
        timeoutMs: remainingMs,
        shouldCancel: async () => Boolean(await input.cancellationCheck()),
      });
      await assertNotCancelled(input.cancellationCheck);
      const outputBytes = await validateCandidate(outputPath, input.originalPageCount);
      const candidate = { settings, outputPath, outputBytes, valid: true };
      candidates.push(candidate);
      await input.onCandidateValidated?.(index + 1, candidate);

      if (isWithinTargetTolerance(outputBytes, input.targetBytes)) break;
    } catch (error) {
      await fs.rm(outputPath, { force: true });
      if (error instanceof PublicApiError && error.category === "OUTPUT_PAGE_COUNT_MISMATCH") {
        pageCountMismatchCount += 1;
        continue;
      }
      if (error instanceof PublicApiError && ["PROCESSING_TIMEOUT", "INVALID_STATE"].includes(error.category)) throw error;
      candidates.push({ settings, outputPath, outputBytes: 0, valid: false });
    }
  }

  if (!candidates.some((candidate) => candidate.valid) && pageCountMismatchCount > 0) {
    throw new PublicApiError("OUTPUT_PAGE_COUNT_MISMATCH", "Every candidate changed the page count.", 500);
  }

  const selected = selectBestCandidate(candidates, input.targetBytes);
  await Promise.all(
    candidates
      .filter((candidate) => candidate.valid && candidate.outputPath !== selected.selectedCandidate.outputPath)
      .map((candidate) => fs.rm(candidate.outputPath, { force: true })),
  );

  return {
    ...selected,
    attemptsUsed: candidates.length,
  };
}
