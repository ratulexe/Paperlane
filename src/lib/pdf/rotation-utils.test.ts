import { describe, expect, it } from "vitest";
import { getNextRotationDegrees, normalizeRotationDegrees } from "@/lib/pdf/rotation-utils";

describe("rotation utilities", () => {
  it.each([
    [-90, 270],
    [0, 0],
    [360, 0],
    [450, 90],
  ])("normalizes %s to %s", (input, expected) => {
    expect(normalizeRotationDegrees(input)).toBe(expected);
  });

  it("applies rotations against existing page rotation", () => {
    expect(getNextRotationDegrees(90, "90-clockwise")).toBe(180);
    expect(getNextRotationDegrees(0, "90-counter-clockwise")).toBe(270);
    expect(getNextRotationDegrees(270, "180")).toBe(90);
  });
});
