import { describe, expect, it } from "vitest";
import { sanitizeFilename } from "@/lib/pdf/download-file";

describe("sanitizeFilename", () => {
  it("removes unsafe filename characters", () => {
    expect(sanitizeFilename('bad<name>:"file"?.pdf')).toBe("bad-name---file--.pdf");
  });

  it("returns a safe fallback for empty names", () => {
    expect(sanitizeFilename("   ")).toBe("paperlane-output.pdf");
  });
});
