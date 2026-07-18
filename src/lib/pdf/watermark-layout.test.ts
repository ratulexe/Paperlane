import { describe, expect, it } from "vitest";
import { calculateWatermarkPosition } from "@/lib/pdf/watermark-layout";

describe("calculateWatermarkPosition", () => {
  it("centers text", () => {
    expect(calculateWatermarkPosition({ pageWidth: 600, pageHeight: 800, textWidth: 100, textHeight: 20, position: "centre" })).toEqual({
      x: 250,
      y: 390,
    });
  });

  it("keeps corner positions inside padding", () => {
    expect(calculateWatermarkPosition({ pageWidth: 600, pageHeight: 800, textWidth: 100, textHeight: 20, position: "top-right", padding: 32 })).toEqual({
      x: 468,
      y: 748,
    });
    expect(calculateWatermarkPosition({ pageWidth: 600, pageHeight: 800, textWidth: 100, textHeight: 20, position: "bottom-left", padding: 32 })).toEqual({
      x: 32,
      y: 32,
    });
  });
});
