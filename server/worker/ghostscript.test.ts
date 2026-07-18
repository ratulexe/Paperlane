import { describe, expect, it } from "vitest";
import { buildGhostscriptArgs } from "./ghostscript.js";

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
});
