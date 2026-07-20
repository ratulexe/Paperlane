import { describe, expect, it } from "vitest";
import { buildGhostscriptArgs, buildProtectGhostscriptArgs, buildTargetGhostscriptArgs } from "./ghostscript.js";

describe("Ghostscript arguments", () => {
  it("uses a fixed argument array and preset mapping", () => {
    expect(buildGhostscriptArgs("/tmp/in.pdf", "/tmp/out.pdf", "balanced")).toEqual([
      "-sDEVICE=pdfwrite",
      "-dCompatibilityLevel=1.4",
      "-dPDFSETTINGS=/ebook",
      "-dNOPAUSE",
      "-dQUIET",
      "-dBATCH",
      "-dSAFER",
      "-sOutputFile=/tmp/out.pdf",
      "/tmp/in.pdf",
    ]);
  });

  it("uses fixed target-size image settings", () => {
    const args = buildTargetGhostscriptArgs("/tmp/in.pdf", "/tmp/out.pdf", { dpi: 72, monoDpi: 96, jpegQuality: 60 });
    expect(args).toContain("-dPDFSETTINGS=/screen");
    expect(args).toContain("-dAutoFilterColorImages=false");
    expect(args).toContain("-dAutoFilterGrayImages=false");
    expect(args).toContain("-dColorImageFilter=/DCTEncode");
    expect(args).toContain("-dGrayImageFilter=/DCTEncode");
    expect(args).toContain("-dColorImageResolution=72");
    expect(args).toContain("-dGrayImageResolution=72");
    expect(args).toContain("-dMonoImageResolution=96");
    expect(args).toContain("-dJPEGQ=60");
    expect(args).toContain("-sOutputFile=/tmp/out.pdf");
    expect(args.at(-1)).toBe("/tmp/in.pdf");
  });

  it("uses Ghostscript-supported PDF password protection settings", () => {
    const args = buildProtectGhostscriptArgs("/tmp/in.pdf", "/tmp/out.pdf", "secret123");
    expect(args).toContain("-dCompatibilityLevel=1.4");
    expect(args).toContain("-dEncryptionR=3");
    expect(args).toContain("-dKeyLength=128");
    expect(args).toContain("-sOwnerPassword=secret123");
    expect(args).toContain("-sUserPassword=secret123");
    expect(args).toContain("-sOutputFile=/tmp/out.pdf");
    expect(args).not.toContain("-dEncryptionR=4");
    expect(args.at(-1)).toBe("/tmp/in.pdf");
  });
});