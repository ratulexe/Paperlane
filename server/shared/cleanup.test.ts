import { describe, expect, it } from "vitest";
import { shouldDeleteCompletedOutput, shouldExpireJob } from "./cleanup.js";
import type { CloudJobRecord } from "./types.js";

function job(overrides: Partial<CloudJobRecord>): CloudJobRecord {
  const now = new Date("2026-07-18T00:00:00.000Z").toISOString();
  return {
    jobId: "job_test",
    tokenHash: "hash",
    toolType: "compress-pdf",
    preset: "balanced",
    state: "awaiting-upload",
    createdAt: now,
    updatedAt: now,
    expiresAt: now,
    inputExpiresAt: now,
    attemptCount: 0,
    cancellationRequested: false,
    deletion: { inputDeleted: false, outputDeleted: false, localFilesDeleted: false },
    ...overrides,
  };
}

describe("cleanup selection", () => {
  it("selects expired active jobs", () => {
    expect(shouldExpireJob(job({ state: "queued" }), new Date("2026-07-18T00:00:01.000Z"))).toBe(true);
  });

  it("selects expired completed outputs", () => {
    expect(
      shouldDeleteCompletedOutput(
        job({
          state: "complete",
          outputKey: "job_test/output.pdf",
          outputExpiresAt: "2026-07-18T00:00:00.000Z",
        }),
        new Date("2026-07-18T00:00:01.000Z"),
      ),
    ).toBe(true);
  });
});
