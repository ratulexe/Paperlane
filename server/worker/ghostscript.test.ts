import { describe, expect, it } from "vitest";
import { buildGhostscriptArgs, buildTargetGhostscriptArgs } from "./ghostscript.js";

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
    const args = buildTargetGhostscriptArgs("/tmp/in.pdf", "/tmp/out.pdf", { dpi: 72, jpegQuality: 60 });
    expect(args).toContain("-dColorImageResolution=72");
    expect(args).toContain("-dGrayImageResolution=72");
    expect(args).toContain("-dJPEGQ=60");
    expect(args).toContain("-sOutputFile=/tmp/out.pdf");
    expect(args.at(-1)).toBe("/tmp/in.pdf");
  });
});
