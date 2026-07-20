import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApiServer } from "./server.js";
import type { ServerConfig } from "../shared/config.js";

let cleanupRoot = "";
let baseUrl = "";
let closeServer: (() => Promise<void>) | undefined;

function config(storageRoot: string): ServerConfig {
  return {
    apiPort: 0,
    allowedOrigins: ["http://localhost:5173"],
    storageRoot,
    maxUploadBytes: 1024 * 1024,
    jobTimeoutMs: 1000,
    inputRetentionMs: 30_000,
    outputRetentionMs: 30_000,
    rateLimitWindowMs: 60_000,
    rateLimitMaxJobs: 5,
    rateLimitMaxUploads: 5,
    workerConcurrency: 1,
    workerPollMs: 100,
    ghostscriptBinary: "gs",
    production: false,
  };
}

beforeEach(async () => {
  cleanupRoot = await fs.mkdtemp(path.join(os.tmpdir(), "paperlane-api-test-"));
  const created = await createApiServer({ config: config(cleanupRoot) });
  await new Promise<void>((resolve) => {
    created.server.listen(0, "127.0.0.1", resolve);
  });
  const address = created.server.address();
  if (!address || typeof address === "string") throw new Error("Missing server address.");
  baseUrl = `http://127.0.0.1:${address.port}`;
  closeServer = () => new Promise((resolve) => created.server.close(() => resolve()));
});

afterEach(async () => {
  await closeServer?.();
  await fs.rm(cleanupRoot, { recursive: true, force: true });
});

describe("compression API", () => {
  it("creates a token-gated compression job", async () => {
    const createResponse = await fetch(`${baseUrl}/api/v1/compression-jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
      body: JSON.stringify({ mode: "preset", preset: "balanced" }),
    });
    expect(createResponse.status).toBe(201);
    expect(createResponse.headers.get("access-control-allow-origin")).toBe("http://localhost:5173");
    const created = (await createResponse.json()) as { job: { jobId: string; state: string }; jobToken: string };
    expect(created.job.state).toBe("awaiting-upload");
    expect(created.jobToken).toBeTruthy();

    const blocked = await fetch(`${baseUrl}/api/v1/compression-jobs/${created.job.jobId}`, {
      headers: { "X-Paperlane-Job-Token": "wrong" },
    });
    expect(blocked.status).toBe(403);

    const status = await fetch(`${baseUrl}/api/v1/compression-jobs/${created.job.jobId}`, {
      headers: { "X-Paperlane-Job-Token": created.jobToken },
    });
    expect(status.status).toBe(200);
    const body = (await status.json()) as { job: { jobId: string; state: string; canDownload: boolean } };
    expect(body.job.jobId).toBe(created.job.jobId);
    expect(body.job.canDownload).toBe(false);
  });

  it("creates a target-size compression job", async () => {
    const createResponse = await fetch(`${baseUrl}/api/v1/compression-jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "target-size", targetBytes: 200 * 1024 }),
    });
    expect(createResponse.status).toBe(201);
    const created = (await createResponse.json()) as { job: { compressionRequest: { mode: string; targetBytes: number } } };
    expect(created.job.compressionRequest).toEqual({ mode: "target-size", targetBytes: 200 * 1024 });
  });

  it.each([
    [{ mode: "target-size", targetBytes: 12 * 1024 }, 400],
    [{ mode: "target-size", targetBytes: 30 * 1024 * 1024 }, 400],
    [{ mode: "target-size", targetBytes: "200 KB" }, 400],
    [{ mode: "unknown", targetBytes: 200 * 1024 }, 400],
    [{ mode: "preset", preset: "balanced", targetBytes: 200 * 1024 }, 400],
    [{ mode: "target-size", preset: "balanced", targetBytes: 200 * 1024 }, 400],
  ])("rejects invalid compression request %#", async (payload, expectedStatus) => {
    const createResponse = await fetch(`${baseUrl}/api/v1/compression-jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(createResponse.status).toBe(expectedStatus);
  });
});
