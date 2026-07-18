import path from "node:path";

export type ServerConfig = {
  apiPort: number;
  allowedOrigins: string[];
  storageRoot: string;
  maxUploadBytes: number;
  jobTimeoutMs: number;
  inputRetentionMs: number;
  outputRetentionMs: number;
  rateLimitWindowMs: number;
  rateLimitMaxJobs: number;
  rateLimitMaxUploads: number;
  workerConcurrency: number;
  workerPollMs: number;
  ghostscriptBinary: string;
  production: boolean;
};

function numberEnv(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${name} must be a positive number.`);
  return value;
}

export function loadServerConfig(): ServerConfig {
  const storageRoot = process.env.PAPERLANE_STORAGE_ROOT ?? "./.paperlane-cloud-storage";
  return {
    apiPort: numberEnv("PAPERLANE_API_PORT", 8787),
    allowedOrigins: (process.env.PAPERLANE_ALLOWED_ORIGINS ?? "http://localhost:5173,http://127.0.0.1:5173")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    storageRoot: path.resolve(storageRoot),
    maxUploadBytes: numberEnv("PAPERLANE_MAX_UPLOAD_BYTES", 25 * 1024 * 1024),
    jobTimeoutMs: numberEnv("PAPERLANE_JOB_TIMEOUT_MS", 120_000),
    inputRetentionMs: numberEnv("PAPERLANE_INPUT_RETENTION_MS", 30 * 60_000),
    outputRetentionMs: numberEnv("PAPERLANE_OUTPUT_RETENTION_MS", 30 * 60_000),
    rateLimitWindowMs: numberEnv("PAPERLANE_RATE_LIMIT_WINDOW_MS", 60_000),
    rateLimitMaxJobs: numberEnv("PAPERLANE_RATE_LIMIT_MAX_JOBS", 8),
    rateLimitMaxUploads: numberEnv("PAPERLANE_RATE_LIMIT_MAX_UPLOADS", 16),
    workerConcurrency: numberEnv("PAPERLANE_WORKER_CONCURRENCY", 1),
    workerPollMs: numberEnv("PAPERLANE_WORKER_POLL_MS", 1_500),
    ghostscriptBinary: process.env.PAPERLANE_GHOSTSCRIPT_BINARY ?? "gs",
    production: process.env.PAPERLANE_PRODUCTION === "true",
  };
}
