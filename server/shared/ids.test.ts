import { describe, expect, it } from "vitest";
import { createToken, hashToken, tokenMatches } from "./ids.js";

describe("job token handling", () => {
  it("verifies high-entropy client-held tokens by hash", () => {
    const token = createToken();
    const hash = hashToken(token);
    expect(tokenMatches(token, hash)).toBe(true);
    expect(tokenMatches(`${token}x`, hash)).toBe(false);
  });
});
