import { describe, expect, it } from "vitest";
import {
  createCandidateSettings,
  isWithinTargetTolerance,
  selectBestCandidate,
  type CompressionCandidateResult,
} from "./target-size-search.js";

function candidate(outputBytes: number, qualityLabel = "Moderate compression"): CompressionCandidateResult {
  return {
    settings: { dpi: 100, jpegQuality: 80, qualityLabel },
    outputPath: `candidate-${outputBytes}.pdf`,
    outputBytes,
    valid: true,
  };
}

describe("target-size candidate search utilities", () => {
  it("caps candidate settings by maximum attempts", () => {
    expect(createCandidateSettings(4)).toHaveLength(4);
    expect(createCandidateSettings(100)).toHaveLength(14);
  });

  it("selects the largest valid output under the target", () => {
    const result = selectBestCandidate([candidate(300), candidate(490), candidate(510), candidate(450)], 500);
    expect(result.targetMet).toBe(true);
    expect(result.selectedCandidate.outputBytes).toBe(490);
    expect(result.smallestCandidate.outputBytes).toBe(300);
  });

  it("falls back to the smallest valid candidate when no candidate reaches the target", () => {
    const result = selectBestCandidate([candidate(700), candidate(620), candidate(840)], 500);
    expect(result.targetMet).toBe(false);
    expect(result.selectedCandidate.outputBytes).toBe(620);
    expect(result.smallestCandidate.outputBytes).toBe(620);
  });

  it("handles non-monotonic candidate sizes and ignores invalid candidates", () => {
    const invalid = { ...candidate(100), valid: false };
    const result = selectBestCandidate([candidate(530), candidate(470), invalid, candidate(480), candidate(430)], 500);
    expect(result.selectedCandidate.outputBytes).toBe(480);
  });

  it("uses an under-target tolerance without requiring exact size", () => {
    expect(isWithinTargetTolerance(196 * 1024, 200 * 1024)).toBe(true);
    expect(isWithinTargetTolerance(170 * 1024, 200 * 1024)).toBe(false);
    expect(isWithinTargetTolerance(201 * 1024, 200 * 1024)).toBe(false);
  });
});
