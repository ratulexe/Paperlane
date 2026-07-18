import type { WatermarkPosition } from "@/types/processing";

export type WatermarkLayoutInput = {
  pageWidth: number;
  pageHeight: number;
  textWidth: number;
  textHeight: number;
  position: WatermarkPosition;
  padding?: number;
};

export function calculateWatermarkPosition({
  pageWidth,
  pageHeight,
  textWidth,
  textHeight,
  position,
  padding = 32,
}: WatermarkLayoutInput) {
  const maxX = Math.max(pageWidth - textWidth - padding, padding);
  const maxY = Math.max(pageHeight - textHeight - padding, padding);
  const centerX = Math.max((pageWidth - textWidth) / 2, padding);
  const centerY = Math.max((pageHeight - textHeight) / 2, padding);

  const x =
    position === "top-left" || position === "bottom-left"
      ? padding
      : position === "top-right" || position === "bottom-right"
        ? maxX
        : centerX;
  const y =
    position === "top-left" || position === "top-right"
      ? maxY
      : position === "bottom-left" || position === "bottom-right"
        ? padding
        : centerY;

  return { x, y };
}
