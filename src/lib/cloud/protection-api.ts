import type { CreateProtectionJobResponse, ProtectionRequest, PublicCloudJob } from "@/types/cloud-processing";
import { CloudApiError } from "@/lib/cloud/compression-api";

const requestTimeoutMs = 30_000;

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

export function createProtectionJob(protection: ProtectionRequest) {
  return requestJson<CreateProtectionJobResponse>("/api/v1/protection-jobs", {
    method: "POST",
    body: JSON.stringify(protection),
  });
}

export async function uploadProtectionInput(jobId: string, token: string, file: File) {
  const response = await fetch(`${apiBaseUrl()}/api/v1/protection-jobs/${jobId}/upload`, {
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

export function startProtectionJob(jobId: string, token: string) {
  return requestJson<{ job: PublicCloudJob }>(`/api/v1/protection-jobs/${jobId}/start`, {
    method: "POST",
    headers: { "X-Paperlane-Job-Token": token },
  });
}

export function getProtectionJob(jobId: string, token: string) {
  return requestJson<{ job: PublicCloudJob }>(`/api/v1/protection-jobs/${jobId}`, {
    headers: { "X-Paperlane-Job-Token": token },
  });
}

export async function downloadProtectionOutput(job: PublicCloudJob, token: string) {
  const response = await fetch(`${apiBaseUrl()}/api/v1/protection-jobs/${job.jobId}/download`, {
    headers: { "X-Paperlane-Job-Token": token },
  });
  if (!response.ok) throw new CloudApiError("Paperlane could not download this protected PDF.", response.status);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = job.safeOutputFilename ?? "paperlane-protected.pdf";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function deleteProtectionJob(jobId: string, token: string) {
  return requestJson<{ job: PublicCloudJob }>(`/api/v1/protection-jobs/${jobId}`, {
    method: "DELETE",
    headers: { "X-Paperlane-Job-Token": token },
  });
}
