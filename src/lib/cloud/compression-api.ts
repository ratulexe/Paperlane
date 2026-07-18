import type { CompressionPreset, CreateCompressionJobResponse, PublicCloudJob } from "@/types/cloud-processing";

const requestTimeoutMs = 30_000;

export class CloudApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function apiBaseUrl() {
  return (import.meta.env.VITE_PAPERLANE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";
}

async function requestJson<T>(path: string, init: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    const response = await fetch(`${apiBaseUrl()}${path}`, {
      ...init,
      signal: init.signal ?? controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
    const body = (await response.json().catch(() => undefined)) as { error?: { message?: string } } | T | undefined;
    if (!response.ok) {
      const errorBody = typeof body === "object" && body !== null && "error" in body ? body : undefined;
      const message = errorBody?.error?.message ?? "Paperlane cloud processing is unavailable.";
      throw new CloudApiError(message, response.status);
    }
    return body as T;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function checkCloudReadiness() {
  const response = await fetch(`${apiBaseUrl()}/ready`, { cache: "no-store" });
  if (!response.ok) throw new CloudApiError("Paperlane cloud processing is not ready.", response.status);
}

export function createCompressionJob(preset: CompressionPreset) {
  return requestJson<CreateCompressionJobResponse>("/api/v1/compression-jobs", {
    method: "POST",
    body: JSON.stringify({ preset }),
  });
}

export async function uploadCompressionInput(jobId: string, token: string, file: File) {
  const response = await fetch(`${apiBaseUrl()}/api/v1/compression-jobs/${jobId}/upload`, {
    method: "POST",
    headers: {
      "Content-Type": file.type || "application/pdf",
      "X-Paperlane-Job-Token": token,
      "X-Paperlane-Filename": file.name,
    },
    body: file,
  });
  const body = (await response.json().catch(() => undefined)) as { job?: PublicCloudJob; error?: { message?: string } } | undefined;
  if (!response.ok || !body?.job) throw new CloudApiError(body?.error?.message ?? "Paperlane could not upload this PDF.", response.status);
  return body.job;
}

export function startCompressionJob(jobId: string, token: string) {
  return requestJson<{ job: PublicCloudJob }>(`/api/v1/compression-jobs/${jobId}/start`, {
    method: "POST",
    headers: { "X-Paperlane-Job-Token": token },
  });
}

export function getCompressionJob(jobId: string, token: string) {
  return requestJson<{ job: PublicCloudJob }>(`/api/v1/compression-jobs/${jobId}`, {
    headers: { "X-Paperlane-Job-Token": token },
  });
}

export async function downloadCompressionOutput(job: PublicCloudJob, token: string) {
  const response = await fetch(`${apiBaseUrl()}/api/v1/compression-jobs/${job.jobId}/download`, {
    headers: { "X-Paperlane-Job-Token": token },
  });
  if (!response.ok) throw new CloudApiError("Paperlane could not download this output.", response.status);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = job.safeOutputFilename ?? "paperlane-compressed.pdf";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function deleteCompressionJob(jobId: string, token: string) {
  return requestJson<{ job: PublicCloudJob }>(`/api/v1/compression-jobs/${jobId}`, {
    method: "DELETE",
    headers: { "X-Paperlane-Job-Token": token },
  });
}
