import { describe, expect, it } from "vitest";
import { targetBytesFromInput, validateTargetSize } from "./target-size";

describe("target size helpers", () => {
  it("converts KB and MB to bytes", () => {
    expect(targetBytesFromInput("200", "KB")).toBe(200 * 1024);
    expect(targetBytesFromInput("2", "MB")).toBe(2 * 1024 * 1024);
  });

  it("rejects ambiguous or invalid target input", () => {
    expect(targetBytesFromInput("2.5", "MB")).toBeUndefined();
    expect(targetBytesFromInput("-1", "KB")).toBeUndefined();
    expect(targetBytesFromInput("abc", "KB")).toBeUndefined();
  });

  it("validates target boundaries and original-size comparison", () => {
    expect(validateTargetSize({ value: "49", unit: "KB", maxUploadBytes: 25 * 1024 * 1024 })).toBe("Enter a target of at least 50 KB.");
    expect(validateTargetSize({ value: "21", unit: "MB", maxUploadBytes: 25 * 1024 * 1024 })).toBe("Choose a target below 20 MB.");
    expect(validateTargetSize({ value: "200", unit: "KB", originalBytes: 150 * 1024, maxUploadBytes: 25 * 1024 * 1024 })).toContain("already below");
    expect(validateTargetSize({ value: "200", unit: "KB", originalBytes: 300 * 1024, maxUploadBytes: 25 * 1024 * 1024 })).toBe("");
  });
});
