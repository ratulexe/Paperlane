import { describe, expect, it } from "vitest";
import {
  IMAGE_MAX_BYTES,
  PDF_MAX_BYTES,
  isImageFileLike,
  isPdfFileLike,
  validateImageFiles,
  validateMergeFiles,
  validatePdfFile,
} from "@/lib/pdf/file-validation";

function file(name: string, size: number, type = "") {
  return new File([new Uint8Array(size)], name, { type });
}

describe("file validation", () => {
  it("accepts PDF files by MIME type or extension", () => {
    expect(isPdfFileLike(file("report.bin", 1, "application/pdf"))).toBe(true);
    expect(isPdfFileLike(file("report.pdf", 1, ""))).toBe(true);
  });

  it("rejects empty and oversized PDFs", () => {
    expect(() => validatePdfFile(file("empty.pdf", 0))).toThrow("empty");
    expect(() => validatePdfFile(file("large.pdf", PDF_MAX_BYTES + 1))).toThrow("50 MB");
  });

  it("validates merge limits", () => {
    expect(() => validateMergeFiles([file("a.pdf", 1)])).toThrow("at least two");
    expect(() => validateMergeFiles(Array.from({ length: 6 }, (_, index) => file(`${index}.pdf`, 1)))).toThrow("five");
  });

  it("accepts and limits image files", () => {
    expect(isImageFileLike(file("photo.jpg", 1))).toBe(true);
    expect(isImageFileLike(file("photo.png", 1, "image/png"))).toBe(true);
    expect(() => validateImageFiles([file("large.png", IMAGE_MAX_BYTES + 1)])).toThrow("20 MB");
  });
});
