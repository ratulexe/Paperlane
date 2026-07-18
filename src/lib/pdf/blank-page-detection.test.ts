import { describe, expect, it } from "vitest";
import { detectBlankImageData } from "@/lib/pdf/blank-page-detection";

function imageDataFromPixels(pixels: number[][]) {
  const data = new Uint8ClampedArray(pixels.flat());
  return { data } as ImageData;
}

describe("detectBlankImageData", () => {
  it("marks white image data as likely blank", () => {
    const result = detectBlankImageData(imageDataFromPixels([
      [255, 255, 255, 255],
      [254, 254, 254, 255],
    ]));

    expect(result.isLikelyBlank).toBe(true);
    expect(result.markedPixelRatio).toBe(0);
  });

  it("marks visible ink as non-blank", () => {
    const result = detectBlankImageData(
      imageDataFromPixels([
        [20, 20, 20, 255],
        [255, 255, 255, 255],
      ]),
      { maxMarkedPixelRatio: 0.1 },
    );

    expect(result.isLikelyBlank).toBe(false);
    expect(result.markedPixelRatio).toBe(0.5);
  });
});
