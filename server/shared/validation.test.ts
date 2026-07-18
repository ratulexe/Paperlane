import { describe, expect, it } from "vitest";
import { PublicApiError } from "./errors.js";
import { calculateCompressionResult, sanitizeFilename, validatePdfUpload } from "./validation.js";

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
});
