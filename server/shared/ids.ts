import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function createId(prefix: string) {
  return `${prefix}_${randomBytes(18).toString("base64url")}`;
}

export function createToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function tokenMatches(token: string, expectedHash: string) {
  const received = Buffer.from(hashToken(token), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}
