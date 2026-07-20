import http from "node:http";
import { FileJobQueue } from "../shared/file-queue.js";
import { FileJobStore } from "../shared/job-store.js";
import { WindowRateLimiter } from "../shared/rate-limit.js";
import { FileStorage } from "../shared/storage.js";
import { loadServerConfig, type ServerConfig } from "../shared/config.js";
import { PublicApiError, publicMessage } from "../shared/errors.js";
import { createId, createToken, hashToken, tokenMatches } from "../shared/ids.js";
import {
  parseCompressionRequest,
  parseProtectionRequest,
  sanitizeFilename,
  sanitizeProtectedFilename,
  validatePdfReadable,
  validatePdfUpload,
  validateTargetBelowOriginal,
} from "../shared/validation.js";
import type { CloudJobRecord, CloudToolType, CreateCompressionJobRequest, CreateProtectionJobRequest } from "../shared/types.js";
import { cleanupJob, cleanupProcessingQueueEntries, shouldDeleteCompletedOutput, shouldExpireJob } from "../shared/cleanup.js";
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

async function getAuthorisedJob(store: FileJobStore, jobId: string, token: string, expectedToolType?: CloudToolType) {
  const job = await store.read(jobId);
  if (!job) throw new PublicApiError("JOB_NOT_FOUND", publicMessage("JOB_NOT_FOUND"), 404);
  if (expectedToolType && job.toolType !== expectedToolType) throw new PublicApiError("JOB_NOT_FOUND", publicMessage("JOB_NOT_FOUND"), 404);
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

async function runCleanup(store: FileJobStore, storage: FileStorage, queue: FileJobQueue) {
  const jobs = await store.list();
  await Promise.all(
    jobs
      .filter((job) => shouldExpireJob(job) || shouldDeleteCompletedOutput(job))
      .map((job) => cleanupJob(job, store, storage)),
  );
  await cleanupProcessingQueueEntries(queue, store, storage);
}

function makeBaseJob(input: { toolType: CloudToolType; tokenHash: string; now: Date; expiresAt: string }): Omit<CloudJobRecord, "jobId"> {
  return {
    tokenHash: input.tokenHash,
    toolType: input.toolType,
    state: "awaiting-upload",
    createdAt: input.now.toISOString(),
    updatedAt: input.now.toISOString(),
    expiresAt: input.expiresAt,
    inputExpiresAt: input.expiresAt,
    attemptCount: 0,
    cancellationRequested: false,
    deletion: { inputDeleted: false, outputDeleted: false, localFilesDeleted: false },
  };
}

function routeToToolType(pathname: string) {
  const compressionMatch = pathname.match(/^\/api\/v1\/compression-jobs\/([^/]+)(?:\/([^/]+))?$/);
  if (compressionMatch) return { toolType: "compress-pdf" as const, jobId: compressionMatch[1], action: compressionMatch[2] };
  const protectionMatch = pathname.match(/^\/api\/v1\/protection-jobs\/([^/]+)(?:\/([^/]+))?$/);
  if (protectionMatch) return { toolType: "protect-pdf" as const, jobId: protectionMatch[1], action: protectionMatch[2] };
  return undefined;
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
        const compressionRequest = parseCompressionRequest(body, config.maxUploadBytes);
        const now = new Date();
        const jobId = createId("job");
        const token = createToken();
        const expiresAt = new Date(now.getTime() + config.inputRetentionMs).toISOString();
        const job: CloudJobRecord = {
          jobId,
          ...makeBaseJob({ toolType: "compress-pdf", tokenHash: hashToken(token), now, expiresAt }),
          compressionRequest,
        };
        await store.create(job);
        sendJson(response, 201, { job: publicJob(job), jobToken: token });
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/v1/protection-jobs") {
        if (!createLimiter.check(`create:${getClientIp(request)}`)) {
          throw new PublicApiError("RATE_LIMITED", publicMessage("RATE_LIMITED"), 429);
        }
        const body = await readJson<CreateProtectionJobRequest>(request);
        const protectionRequest = parseProtectionRequest(body);
        const now = new Date();
        const jobId = createId("job");
        const token = createToken();
        const expiresAt = new Date(now.getTime() + config.inputRetentionMs).toISOString();
        const job: CloudJobRecord = {
          jobId,
          ...makeBaseJob({ toolType: "protect-pdf", tokenHash: hashToken(token), now, expiresAt }),
          protectionRequest,
        };
        await store.create(job);
        sendJson(response, 201, { job: publicJob(job), jobToken: token });
        return;
      }

      const route = routeToToolType(url.pathname);
      if (!route) {
        throw new PublicApiError("JOB_NOT_FOUND", publicMessage("JOB_NOT_FOUND"), 404);
      }

      const token = requireToken(request);
      const job = await getAuthorisedJob(store, route.jobId, token, route.toolType);

      if (request.method === "POST" && route.action === "upload") {
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
        if (job.toolType === "compress-pdf" && job.compressionRequest?.mode === "target-size") {
          validateTargetBelowOriginal(job.compressionRequest.targetBytes, bytes.length);
        }
        const inputKey = storage.createInputKey(job.jobId);
        await storage.putInput(inputKey, bytes);
        const safeOutputFilename = job.toolType === "protect-pdf" ? sanitizeProtectedFilename(filename) : sanitizeFilename(filename);
        const updated = await store.update(job.jobId, (current) => ({
          ...current,
          state: "created",
          inputKey,
          originalBytes: bytes.length,
          originalFilename: safeOutputFilename.replace(/-(compressed|protected)\.pdf$/i, ".pdf"),
          safeOutputFilename,
        }));
        sendJson(response, 200, { job: publicJob(updated ?? job) });
        return;
      }

      if (request.method === "POST" && route.action === "start") {
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

      if (request.method === "GET" && !route.action) {
        sendJson(response, 200, { job: publicJob(job) });
        return;
      }

      if (request.method === "GET" && route.action === "download") {
        if (job.state !== "complete" || !job.outputKey || !job.outputExpiresAt) {
          throw new PublicApiError("INVALID_STATE", publicMessage("INVALID_STATE"), 409);
        }
        if (new Date(job.outputExpiresAt).getTime() <= Date.now()) {
          throw new PublicApiError("DOWNLOAD_EXPIRED", publicMessage("DOWNLOAD_EXPIRED"), 410);
        }
        response.writeHead(200, {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${job.safeOutputFilename ?? (job.toolType === "protect-pdf" ? "paperlane-protected.pdf" : "paperlane-compressed.pdf")}"`,
          "Cache-Control": "no-store",
        });
        storage.getOutputStream(job.outputKey).pipe(response);
        return;
      }

      if (request.method === "DELETE" && !route.action) {
        const isInFlight = job.state === "processing" || job.state === "validating" || job.state === "validating-output";
        const updated = await store.update(job.jobId, (current) => ({
          ...current,
          state: isInFlight ? current.state : "cancelled",
          cancellationRequested: true,
          protectionRequest: current.toolType === "protect-pdf" && !isInFlight ? undefined : current.protectionRequest,
          errorCategory: undefined,
        }));
        if (!isInFlight) await cleanupJob(updated ?? job, store, storage);
        sendJson(response, 200, { job: publicJob((await store.read(job.jobId)) ?? job) });
        return;
      }

      throw new PublicApiError("JOB_NOT_FOUND", publicMessage("JOB_NOT_FOUND"), 404);
    } catch (error) {
      sendError(response, error, id);
    }
  });

  const cleanupTimer = setInterval(() => {
    void runCleanup(store, storage, queue).catch(() => undefined);
  }, 60_000);
  server.on("close", () => clearInterval(cleanupTimer));

  return { server, config, storage, store, queue };
}
