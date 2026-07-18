import path from "node:path";
import { PDFDocument } from "pdf-lib";
import { PublicApiError } from "./errors.js";
import type { CompressionPreset, CompressionResult } from "./types.js";

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

export async function validatePdfReadable(bytes: Uint8Array) {
  try {
    await PDFDocument.load(bytes, { ignoreEncryption: false });
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("encrypted")) throw new PublicApiError("ENCRYPTED_PDF", "Encrypted PDF.", 400);
    throw new PublicApiError("INVALID_PDF", "Invalid PDF.", 400);
  }
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
