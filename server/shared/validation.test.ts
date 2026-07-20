import { describe, expect, it } from "vitest";
import { PublicApiError } from "./errors.js";
import {
  calculateCompressionResult,
  calculateTargetCompressionResult,
  parseCompressionRequest,
  parseProtectionRequest,
  sanitizeFilename,
  sanitizeProtectedFilename,
  validatePdfUpload,
  validateTargetBelowOriginal,
  validateTargetBytes,
} from "./validation.js";

describe("cloud PDF validation", () => {
  it("requires a PDF extension, MIME type, non-empty body and header", () => {
    expect(() =>
      validatePdfUpload({
        filename: "document.pdf",
        mimeType: "application/pdf",
        bytes: Buffer.from("%PDF-1.7\n"),
        maxUploadBytes: 100,
      }),
    ).not.toThrow();
    expect(() =>
      validatePdfUpload({
        filename: "document.txt",
        mimeType: "text/plain",
        bytes: Buffer.from("hello"),
        maxUploadBytes: 100,
      }),
    ).toThrow(PublicApiError);
  });

  it("enforces upload size", () => {
    expect(() =>
      validatePdfUpload({
        filename: "document.pdf",
        mimeType: "application/pdf",
        bytes: Buffer.from("%PDF-1.7\nlarge"),
        maxUploadBytes: 4,
      }),
    ).toThrow(PublicApiError);
  });

  it("sanitises output filenames", () => {
    expect(sanitizeFilename("../bad<script>.pdf")).toBe("bad_script_-compressed.pdf");
    expect(sanitizeProtectedFilename("../bad<script>.pdf")).toBe("bad_script_-protected.pdf");
  });

  it("calculates real compression results and larger outputs", () => {
    expect(calculateCompressionResult(1000, 400)).toEqual({
      originalBytes: 1000,
      outputBytes: 400,
      savedBytes: 600,
      savedPercent: 60,
      outputLarger: false,
    });
    expect(calculateCompressionResult(1000, 1040)).toEqual({
      originalBytes: 1000,
      outputBytes: 1040,
      savedBytes: -40,
      savedPercent: -4,
      outputLarger: true,
    });
  });

  it("parses preset and target-size compression requests", () => {
    expect(parseCompressionRequest({ mode: "preset", preset: "balanced" }, 25 * 1024 * 1024)).toEqual({
      mode: "preset",
      preset: "balanced",
    });
    expect(parseCompressionRequest({ mode: "target-size", targetBytes: 200 * 1024 }, 25 * 1024 * 1024)).toEqual({
      mode: "target-size",
      targetBytes: 200 * 1024,
    });
    expect(() => parseCompressionRequest({ mode: "target-size", targetBytes: 2048 }, 25 * 1024 * 1024)).toThrow(PublicApiError);
  });

  it("parses protect PDF password requests without exposing extra modes", () => {
    expect(parseProtectionRequest({ mode: "password", userPassword: "secret1" })).toEqual({
      mode: "password",
      userPassword: "secret1",
    });
    expect(parseProtectionRequest({ protection: { mode: "password", userPassword: "secret1", ownerPassword: "owner1" } })).toEqual({
      mode: "password",
      userPassword: "secret1",
      ownerPassword: "owner1",
    });
    expect(() => parseProtectionRequest({ mode: "password", userPassword: "123" })).toThrow(PublicApiError);
    expect(() => parseProtectionRequest({ mode: "unknown", userPassword: "secret1" })).toThrow(PublicApiError);
  });

  it("validates target byte boundaries and original-size comparison", () => {
    expect(validateTargetBytes(50 * 1024, 25 * 1024 * 1024)).toBe(50 * 1024);
    expect(() => validateTargetBytes(Number.NaN, 25 * 1024 * 1024)).toThrow(PublicApiError);
    expect(() => validateTargetBytes(49 * 1024, 25 * 1024 * 1024)).toThrow(PublicApiError);
    expect(() => validateTargetBytes(21 * 1024 * 1024, 25 * 1024 * 1024)).toThrow(PublicApiError);
    expect(() => validateTargetBelowOriginal(200 * 1024, 200 * 1024)).toThrow(PublicApiError);
    expect(() => validateTargetBelowOriginal(199 * 1024, 200 * 1024)).not.toThrow();
  });

  it("calculates target-size result metadata", () => {
    expect(
      calculateTargetCompressionResult({
        originalBytes: 1000,
        outputBytes: 490,
        targetBytes: 500,
        targetMet: true,
        attemptsUsed: 4,
        qualityLabel: "Moderate compression",
        smallestCandidateBytes: 420,
      }),
    ).toMatchObject({
      savedBytes: 510,
      savedPercent: 51,
      targetBytes: 500,
      targetMet: true,
      attemptsUsed: 4,
      selectedCandidateBytes: 490,
      targetDifferenceBytes: -10,
    });
  });
});
