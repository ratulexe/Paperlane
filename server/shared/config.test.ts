import { afterEach, describe, expect, it } from "vitest";
import { loadServerConfig } from "./config.js";

const originalPort = process.env.PORT;
const originalPaperlanePort = process.env.PAPERLANE_API_PORT;

afterEach(() => {
  if (originalPort === undefined) delete process.env.PORT;
  else process.env.PORT = originalPort;
  if (originalPaperlanePort === undefined) delete process.env.PAPERLANE_API_PORT;
  else process.env.PAPERLANE_API_PORT = originalPaperlanePort;
});

describe("server config", () => {
  it("prefers Railway PORT over local PAPERLANE_API_PORT", () => {
    process.env.PORT = "9999";
    process.env.PAPERLANE_API_PORT = "8787";

    expect(loadServerConfig().apiPort).toBe(9999);
  });

  it("falls back to PAPERLANE_API_PORT when PORT is not provided", () => {
    delete process.env.PORT;
    process.env.PAPERLANE_API_PORT = "8788";

    expect(loadServerConfig().apiPort).toBe(8788);
  });
});
