export type BlankPageDetectionOptions = {
  whiteThreshold?: number;
  maxMarkedPixelRatio?: number;
};

export type BlankPageDetectionResult = {
  isLikelyBlank: boolean;
  markedPixelRatio: number;
};

export function detectBlankImageData(
  imageData: ImageData,
  {
    whiteThreshold = 248,
    maxMarkedPixelRatio = 0.006,
  }: BlankPageDetectionOptions = {},
): BlankPageDetectionResult {
  const { data } = imageData;
  let markedPixels = 0;
  const pixelCount = Math.max(data.length / 4, 1);

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const alpha = data[index + 3];

    if (alpha > 20 && (red < whiteThreshold || green < whiteThreshold || blue < whiteThreshold)) {
      markedPixels += 1;
    }
  }

  const markedPixelRatio = markedPixels / pixelCount;
  return {
    isLikelyBlank: markedPixelRatio <= maxMarkedPixelRatio,
    markedPixelRatio,
  };
}
