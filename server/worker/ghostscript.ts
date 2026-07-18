import { spawn } from "node:child_process";
import { PublicApiError } from "../shared/errors.js";
import { compressionPresets } from "../shared/validation.js";
import type { CompressionPreset } from "../shared/types.js";

export function buildGhostscriptArgs(inputPath: string, outputPath: string, preset: CompressionPreset) {
  const config = compressionPresets[preset];
  return [
    "-sDEVICE=pdfwrite",
    "-dCompatibilityLevel=1.4",
    `-dPDFSETTINGS=${config.pdfSettings}`,
    "-dNOPAUSE",
    "-dQUIET",
    "-dBATCH",
    "-dSAFER",
    `-sOutputFile=${outputPath}`,
    inputPath,
  ];
}

export function runGhostscript(options: {
  binary: string;
  inputPath: string;
  outputPath: string;
  preset: CompressionPreset;
  timeoutMs: number;
  shouldCancel?: () => Promise<boolean>;
}) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(options.binary, buildGhostscriptArgs(options.inputPath, options.outputPath, options.preset), {
      windowsHide: true,
      stdio: ["ignore", "ignore", "pipe"],
    });
    let settled = false;
    let stderr = "";

    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      clearInterval(cancelInterval);
      if (error) reject(error);
      else resolve();
    };

    const timeout = setTimeout(() => {
      child.kill("SIGKILL");
      finish(new PublicApiError("PROCESSING_TIMEOUT", "Ghostscript timed out.", 504));
    }, options.timeoutMs);

    const cancelInterval = setInterval(() => {
      void options.shouldCancel?.().then((cancel) => {
        if (cancel && !settled) {
          child.kill("SIGTERM");
          finish(new PublicApiError("INVALID_STATE", "Cancellation requested.", 409));
        }
      });
    }, 500);

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8").slice(0, 400);
    });
    child.on("error", () => finish(new PublicApiError("COMPRESSION_FAILED", "Ghostscript failed.", 500)));
    child.on("close", (code) => {
      if (code === 0) finish();
      else finish(new PublicApiError("COMPRESSION_FAILED", stderr || "Ghostscript exited with an error.", 500));
    });
  });
}
