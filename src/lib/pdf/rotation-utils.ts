import type { RotationOption } from "@/types/processing";

export const rotationDegrees: Record<RotationOption, number> = {
  "90-clockwise": 90,
  "90-counter-clockwise": -90,
  "180": 180,
};

export function normalizeRotationDegrees(degrees: number) {
  return ((degrees % 360) + 360) % 360;
}

export function getNextRotationDegrees(currentDegrees: number, rotation: RotationOption) {
  return normalizeRotationDegrees(currentDegrees + rotationDegrees[rotation]);
}
