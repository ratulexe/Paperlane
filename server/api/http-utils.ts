import type { IncomingMessage, ServerResponse } from "node:http";
import { PublicApiError, publicMessage } from "../shared/errors.js";
import type { ApiErrorResponse, PublicCloudJob, CloudJobRecord } from "../shared/types.js";

export function requestId() {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function sendJson(response: ServerResponse, statusCode: number, value: unknown) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(value));
}

export function sendError(response: ServerResponse, error: unknown, id: string) {
  const publicError =
    error instanceof PublicApiError
      ? error
      : new PublicApiError("INTERNAL_ERROR", publicMessage("INTERNAL_ERROR"), 500);
  const payload: ApiErrorResponse = {
    error: {
      category: publicError.category,
      message: publicMessage(publicError.category),
      requestId: id,
    },
  };
  sendJson(response, publicError.statusCode, payload);
}

export async function readJson<T>(request: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  if (!chunks.length) return {} as T;
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as T;
}

export async function readBodyWithLimit(request: IncomingMessage, limitBytes: number) {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buffer.length;
    if (total > limitBytes) throw new PublicApiError("FILE_TOO_LARGE", "Upload too large.", 413);
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

export function getClientIp(request: IncomingMessage) {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) return forwarded.split(",")[0].trim();
  return request.socket.remoteAddress ?? "unknown";
}

export function publicJob(job: CloudJobRecord): PublicCloudJob {
  const now = Date.now();
  return {
    jobId: job.jobId,
    toolType: job.toolType,
    compressionRequest: job.compressionRequest,
    state: job.state,
    subStage: job.subStage,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    expiresAt: job.expiresAt,
    inputExpiresAt: job.inputExpiresAt,
    outputExpiresAt: job.outputExpiresAt,
    originalBytes: job.originalBytes,
    outputBytes: job.outputBytes,
    compression: job.compression,
    protection: job.protection,
    safeOutputFilename: job.safeOutputFilename,
    originalFilename: job.originalFilename,
    errorCategory: job.errorCategory,
    attemptCount: job.attemptCount,
    cancellationRequested: job.cancellationRequested,
    deletion: job.deletion,
    canDownload: job.state === "complete" && Boolean(job.outputKey) && Boolean(job.outputExpiresAt && new Date(job.outputExpiresAt).getTime() > now),
  };
}
