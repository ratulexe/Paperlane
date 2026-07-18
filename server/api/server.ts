import http from "node:http";
import { FileJobQueue } from "../shared/file-queue.js";
import { FileJobStore } from "../shared/job-store.js";
import { WindowRateLimiter } from "../shared/rate-limit.js";
import { FileStorage } from "../shared/storage.js";
import { loadServerConfig, type ServerConfig } from "../shared/config.js";
import { PublicApiError, publicMessage } from "../shared/errors.js";
import { createId, createToken, hashToken, tokenMatches } from "../shared/ids.js";
import { assertCompressionPreset, sanitizeFilename, validatePdfReadable, validatePdfUpload } from "../shared/validation.js";
import type { CloudJobRecord, CreateCompressionJobRequest } from "../shared/types.js";
import { cleanupJob, shouldDeleteCompletedOutput, shouldExpireJob } from "../shared/cleanup.js";
import { getClientIp, publicJob, readBodyWithLimit, readJson, requestId, sendError, sendJson } from "./http-utils.js";

export type ApiDependencies = {
  config?: ServerConfig;
  storage?: FileStorage;
  store?: FileJobStore;
  queue?: FileJobQueue;
};

function requireToken(request: http.IncomingMessage) {
  const token = request.headers["x-paperlane-job-token"];
  if (typeof token !== "string" || !token) {
    throw new PublicApiError("UNAUTHORISED_JOB", publicMessage("UNAUTHORISED_JOB"), 401);
  }
  return token;
}

async function getAuthorisedJob(store: FileJobStore, jobId: string, token: string) {
  const job = await store.read(jobId);
  if (!job) throw new PublicApiError("JOB_NOT_FOUND", publicMessage("JOB_NOT_FOUND"), 404);
  if (!tokenMatches(token, job.tokenHash)) {
    throw new PublicApiError("UNAUTHORISED_JOB", publicMessage("UNAUTHORISED_JOB"), 403);
  }
  if (new Date(job.expiresAt).getTime() <= Date.now() && job.state !== "complete") {
    throw new PublicApiError("JOB_EXPIRED", publicMessage("JOB_EXPIRED"), 410);
  }
  return job;
}

function applyCors(request: http.IncomingMessage, response: http.ServerResponse, config: ServerConfig) {
  const origin = request.headers.origin;
  if (typeof origin === "string" && config.allowedOrigins.includes(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
  }
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Paperlane-Job-Token, X-Paperlane-Filename");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
}

async function runCleanup(store: FileJobStore, storage: FileStorage) {
  const jobs = await store.list();
  await Promise.all(
    jobs
      .filter((job) => shouldExpireJob(job) || shouldDeleteCompletedOutput(job))
      .map((job) => cleanupJob(job, store, storage)),
  );
}

export async function createApiServer(dependencies: ApiDependencies = {}) {
  const config = dependencies.config ?? loadServerConfig();
  const storage = dependencies.storage ?? new FileStorage(config.storageRoot);
  await storage.ensureReady();
  const store = dependencies.store ?? new FileJobStore(storage.jobsDir);
  await store.ensureReady();
  const queue = dependencies.queue ?? new FileJobQueue(storage.queueDir, storage.processingQueueDir);
  await queue.ensureReady();

  const createLimiter = new WindowRateLimiter(config.rateLimitWindowMs, config.rateLimitMaxJobs);
  const uploadLimiter = new WindowRateLimiter(config.rateLimitWindowMs, config.rateLimitMaxUploads);

  const server = http.createServer(async (request, response) => {
    const id = requestId();
    applyCors(request, response, config);
    if (request.method === "OPTIONS") {
      response.writeHead(204);
      response.end();
      return;
    }

    try {
      const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

      if (request.method === "GET" && url.pathname === "/health") {
        sendJson(response, 200, { ok: true });
        return;
      }

      if (request.method === "GET" && url.pathname === "/ready") {
        await storage.ensureReady();
        sendJson(response, 200, { ok: true, storage: "ready", queue: "ready" });
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/v1/compression-jobs") {
        if (!createLimiter.check(`create:${getClientIp(request)}`)) {
          throw new PublicApiError("RATE_LIMITED", publicMessage("RATE_LIMITED"), 429);
        }
        const body = await readJson<CreateCompressionJobRequest>(request);
        assertCompressionPreset(body.preset);
        const now = new Date();
        const jobId = createId("job");
        const token = createToken();
        const expiresAt = new Date(now.getTime() + config.inputRetentionMs).toISOString();
        const job: CloudJobRecord = {
          jobId,
          tokenHash: hashToken(token),
          toolType: "compress-pdf",
          preset: body.preset,
          state: "awaiting-upload",
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          expiresAt,
          inputExpiresAt: expiresAt,
          attemptCount: 0,
          cancellationRequested: false,
          deletion: { inputDeleted: false, outputDeleted: false, localFilesDeleted: false },
        };
        await store.create(job);
        sendJson(response, 201, { job: publicJob(job), jobToken: token });
        return;
      }

      const jobMatch = url.pathname.match(/^\/api\/v1\/compression-jobs\/([^/]+)(?:\/([^/]+))?$/);
      if (!jobMatch) {
        throw new PublicApiError("JOB_NOT_FOUND", publicMessage("JOB_NOT_FOUND"), 404);
      }

      const [, jobId, action] = jobMatch;
      const token = requireToken(request);
      const job = await getAuthorisedJob(store, jobId, token);

      if (request.method === "POST" && action === "upload") {
        if (!uploadLimiter.check(`upload:${getClientIp(request)}`)) {
          throw new PublicApiError("RATE_LIMITED", publicMessage("RATE_LIMITED"), 429);
        }
        if (job.state !== "awaiting-upload") {
          throw new PublicApiError("INVALID_STATE", publicMessage("INVALID_STATE"), 409);
        }
        const bytes = await readBodyWithLimit(request, config.maxUploadBytes);
        const filename = typeof request.headers["x-paperlane-filename"] === "string" ? request.headers["x-paperlane-filename"] : "document.pdf";
        const mimeType = typeof request.headers["content-type"] === "string" ? request.headers["content-type"] : "";
        validatePdfUpload({ filename, mimeType, bytes, maxUploadBytes: config.maxUploadBytes });
        await validatePdfReadable(bytes);
        const inputKey = storage.createInputKey(job.jobId);
        await storage.putInput(inputKey, bytes);
        const updated = await store.update(job.jobId, (current) => ({
          ...current,
          state: "created",
          inputKey,
          originalBytes: bytes.length,
          originalFilename: sanitizeFilename(filename).replace(/-compressed\.pdf$/i, ".pdf"),
          safeOutputFilename: sanitizeFilename(filename),
        }));
        sendJson(response, 200, { job: publicJob(updated ?? job) });
        return;
      }

      if (request.method === "POST" && action === "start") {
        if (job.state === "queued" || job.state === "processing" || job.state === "validating" || job.state === "validating-output") {
          throw new PublicApiError("JOB_ALREADY_STARTED", publicMessage("JOB_ALREADY_STARTED"), 409);
        }
        if (job.state !== "created" || !job.inputKey) {
          throw new PublicApiError("INVALID_STATE", publicMessage("INVALID_STATE"), 409);
        }
        const updated = await store.update(job.jobId, (current) => ({ ...current, state: "queued" }));
        await queue.enqueue(job.jobId);
        sendJson(response, 200, { job: publicJob(updated ?? job) });
        return;
      }

      if (request.method === "GET" && !action) {
        sendJson(response, 200, { job: publicJob(job) });
        return;
      }

      if (request.method === "GET" && action === "download") {
        if (job.state !== "complete" || !job.outputKey || !job.outputExpiresAt) {
          throw new PublicApiError("INVALID_STATE", publicMessage("INVALID_STATE"), 409);
        }
        if (new Date(job.outputExpiresAt).getTime() <= Date.now()) {
          throw new PublicApiError("DOWNLOAD_EXPIRED", publicMessage("DOWNLOAD_EXPIRED"), 410);
        }
        response.writeHead(200, {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${job.safeOutputFilename ?? "paperlane-compressed.pdf"}"`,
          "Cache-Control": "no-store",
        });
        storage.getOutputStream(job.outputKey).pipe(response);
        return;
      }

      if (request.method === "DELETE" && !action) {
        const updated = await store.update(job.jobId, (current) => ({
          ...current,
          state: current.state === "processing" ? current.state : "cancelled",
          cancellationRequested: true,
        }));
        await cleanupJob(updated ?? job, store, storage);
        sendJson(response, 200, { job: publicJob((await store.read(job.jobId)) ?? job) });
        return;
      }

      throw new PublicApiError("JOB_NOT_FOUND", publicMessage("JOB_NOT_FOUND"), 404);
    } catch (error) {
      sendError(response, error, id);
    }
  });

  const cleanupTimer = setInterval(() => {
    void runCleanup(store, storage).catch(() => undefined);
  }, 60_000);
  server.on("close", () => clearInterval(cleanupTimer));

  return { server, config, storage, store, queue };
}
