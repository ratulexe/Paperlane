import { describe, expect, it } from "vitest";
import { WindowRateLimiter } from "./rate-limit.js";

describe("rate limiting", () => {
  it("limits hits inside a window and allows after expiry", () => {
    const limiter = new WindowRateLimiter(1000, 2);
    expect(limiter.check("client", 1000)).toBe(true);
    expect(limiter.check("client", 1200)).toBe(true);
    expect(limiter.check("client", 1300)).toBe(false);
    expect(limiter.check("client", 2301)).toBe(true);
  });
});
