import { describe, expect, it } from "vitest";
import { acceptedTypeActionLabel, acceptedTypeAttribute, formatFileSize, getFileExtension } from "@/lib/file-demo";
import { imageFileType, pdfFileType, wordFileType } from "@/data/tools";

describe("file-demo utilities", () => {
  it("formats file sizes", () => {
    expect(formatFileSize(0)).toBe("0 KB");
    expect(formatFileSize(1024)).toBe("1.0 KB");
  });

  it("extracts lowercase extensions", () => {
    expect(getFileExtension("Report.PDF")).toBe("pdf");
  });

  it("builds file input accept attributes", () => {
    expect(acceptedTypeAttribute([wordFileType])).toContain(".docx");
    expect(acceptedTypeAttribute([pdfFileType])).toContain("application/pdf");
  });

  it("uses clearer action labels", () => {
    expect(acceptedTypeActionLabel([wordFileType])).toBe("Select Word Document");
    expect(acceptedTypeActionLabel([imageFileType])).toBe("Select Image File");
  });
});
