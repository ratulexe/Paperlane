import path from "node:path";
import { PDFDocument } from "pdf-lib";
import { PublicApiError } from "./errors.js";
import type { CompressionPreset, CompressionRequest, CompressionResult } from "./types.js";

export const targetSizeLimits = {
  minimumBytes: 50 * 1024,
  maximumBytes: 20 * 1024 * 1024,
};

export const compressionPresets: Record<CompressionPreset, { label: string; pdfSettings: string }> = {
  "high-quality": { label: "High quality", pdfSettings: "/prepress" },
  balanced: { label: "Balanced", pdfSettings: "/ebook" },
  "smallest-size": { label: "Smallest size", pdfSettings: "/screen" },
};

export function assertCompressionPreset(value: string): asserts value is CompressionPreset {
  if (!Object.prototype.hasOwnProperty.call(compressionPresets, value)) {
    throw new PublicApiError("INVALID_STATE", "Unsupported compression preset.", 400);
  }
}

export function parseCompressionRequest(body: unknown, maxUploadBytes: number): CompressionRequest {
  if (typeof body !== "object" || body === null) {
    throw new PublicApiError("INVALID_STATE", "Missing compression mode.", 400);
  }

  const record = body as Record<string, unknown>;
  const candidate = typeof record.compression === "object" && record.compression !== null ? record.compression as Record<string, unknown> : record;

  if (!("mode" in candidate)) {
    if (typeof record.preset === "string") {
      assertCompressionPreset(record.preset);
      return { mode: "preset", preset: record.preset };
    }
    throw new PublicApiError("INVALID_STATE", "Missing compression mode.", 400);
  }

  if (candidate.mode === "preset") {
    if (typeof candidate.preset !== "string") {
      throw new PublicApiError("INVALID_STATE", "Missing compression preset.", 400);
    }
    if ("targetBytes" in candidate) throw new PublicApiError("INVALID_STATE", "Preset jobs cannot include target size.", 400);
    assertCompressionPreset(candidate.preset);
    return { mode: "preset", preset: candidate.preset };
  }

  if (candidate.mode === "target-size") {
    if ("preset" in candidate) throw new PublicApiError("INVALID_STATE", "Target-size jobs cannot include a preset.", 400);
    if (typeof candidate.targetBytes !== "number") {
      throw new PublicApiError("INVALID_TARGET_SIZE", "Invalid target size.", 400);
    }
    return { mode: "target-size", targetBytes: validateTargetBytes(candidate.targetBytes, maxUploadBytes) };
  }

  throw new PublicApiError("INVALID_STATE", "Unsupported compression mode.", 400);
}

export function validateTargetBytes(value: number, maxUploadBytes: number) {
  if (!Number.isFinite(value) || !Number.isSafeInteger(value) || value <= 0) {
    throw new PublicApiError("INVALID_TARGET_SIZE", "Invalid target size.", 400);
  }
  if (value < targetSizeLimits.minimumBytes) throw new PublicApiError("TARGET_TOO_SMALL", "Target too small.", 400);
  const maximumTargetBytes = Math.min(targetSizeLimits.maximumBytes, maxUploadBytes - 1);
  if (value > maximumTargetBytes) throw new PublicApiError("TARGET_TOO_LARGE", "Target too large.", 400);
  return value;
}

export function validateTargetBelowOriginal(targetBytes: number, originalBytes: number) {
  if (targetBytes >= originalBytes) {
    throw new PublicApiError("TARGET_NOT_SMALLER_THAN_ORIGINAL", "Target is not smaller than original.", 400);
  }
}

export function sanitizeFilename(filename: string) {
  const base = path.basename(filename).replace(/[^\w .()-]/g, "_").trim();
  const withoutExtension = base.replace(/\.pdf$/i, "") || "paperlane-document";
  return `${withoutExtension.slice(0, 90)}-compressed.pdf`;
}

export function validatePdfUpload(input: {
  filename: string;
  mimeType: string;
  bytes: Buffer;
  maxUploadBytes: number;
}) {
  if (!input.bytes.length) throw new PublicApiError("EMPTY_FILE", "Empty file.", 400);
  if (input.bytes.length > input.maxUploadBytes) throw new PublicApiError("FILE_TOO_LARGE", "File too large.", 413);
  if (!input.filename.toLowerCase().endsWith(".pdf")) throw new PublicApiError("INVALID_FILE_TYPE", "Invalid extension.", 400);
  if (input.mimeType && !input.mimeType.toLowerCase().includes("application/pdf")) {
    throw new PublicApiError("INVALID_FILE_TYPE", "Invalid MIME type.", 400);
  }
  if (!input.bytes.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
    throw new PublicApiError("INVALID_PDF", "Invalid PDF header.", 400);
  }
}

export async function loadReadablePdf(bytes: Uint8Array) {
  try {
    return await PDFDocument.load(bytes, { ignoreEncryption: false });
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("encrypted")) throw new PublicApiError("ENCRYPTED_PDF", "Encrypted PDF.", 400);
    throw new PublicApiError("INVALID_PDF", "Invalid PDF.", 400);
  }
}

export async function validatePdfReadable(bytes: Uint8Array) {
  await loadReadablePdf(bytes);
}

export async function getPdfPageCount(bytes: Uint8Array) {
  const pdf = await loadReadablePdf(bytes);
  return pdf.getPageCount();
}

export function calculateCompressionResult(originalBytes: number, outputBytes: number): CompressionResult {
  if (originalBytes <= 0 || outputBytes <= 0) {
    throw new PublicApiError("OUTPUT_INVALID", "Invalid byte size.", 500);
  }
  const savedBytes = originalBytes - outputBytes;
  return {
    originalBytes,
    outputBytes,
    savedBytes,
    savedPercent: Math.round((savedBytes / originalBytes) * 1000) / 10,
    outputLarger: outputBytes > originalBytes,
  };
}

export function calculateTargetCompressionResult(input: {
  originalBytes: number;
  outputBytes: number;
  targetBytes: number;
  targetMet: boolean;
  attemptsUsed: number;
  qualityLabel: string;
  smallestCandidateBytes: number;
}) {
  const result = calculateCompressionResult(input.originalBytes, input.outputBytes);
  return {
    ...result,
    targetBytes: input.targetBytes,
    targetMet: input.targetMet,
    attemptsUsed: input.attemptsUsed,
    qualityLabel: input.qualityLabel,
    smallestCandidateBytes: input.smallestCandidateBytes,
    selectedCandidateBytes: input.outputBytes,
    targetDifferenceBytes: input.outputBytes - input.targetBytes,
  };
}
