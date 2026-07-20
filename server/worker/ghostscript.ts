import { spawn } from "node:child_process";
import { PublicApiError } from "../shared/errors.js";
import { compressionPresets } from "../shared/validation.js";
import type { CompressionPreset } from "../shared/types.js";

export type TargetGhostscriptSettings = {
  dpi: number;
  monoDpi?: number;
  jpegQuality: number;
};

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

export function buildTargetGhostscriptArgs(inputPath: string, outputPath: string, settings: TargetGhostscriptSettings) {
  const monoDpi = settings.monoDpi ?? Math.max(settings.dpi, 150);

  return [
    "-sDEVICE=pdfwrite",
    "-dCompatibilityLevel=1.4",
    "-dPDFSETTINGS=/screen",
    "-dNOPAUSE",
    "-dQUIET",
    "-dBATCH",
    "-dSAFER",
    "-dDetectDuplicateImages=true",
    "-dCompressFonts=true",
    "-dSubsetFonts=true",
    "-dAutoRotatePages=/None",
    "-dAutoFilterColorImages=false",
    "-dAutoFilterGrayImages=false",
    "-dColorImageFilter=/DCTEncode",
    "-dGrayImageFilter=/DCTEncode",
    "-dColorImageDownsampleType=/Bicubic",
    "-dGrayImageDownsampleType=/Bicubic",
    "-dMonoImageDownsampleType=/Subsample",
    "-dDownsampleColorImages=true",
    "-dDownsampleGrayImages=true",
    "-dDownsampleMonoImages=true",
    `-dColorImageResolution=${settings.dpi}`,
    `-dGrayImageResolution=${settings.dpi}`,
    `-dMonoImageResolution=${monoDpi}`,
    `-dJPEGQ=${settings.jpegQuality}`,
    `-sOutputFile=${outputPath}`,
    inputPath,
  ];
}

export function runGhostscriptWithArgs(options: {
  binary: string;
  args: string[];
  timeoutMs: number;
  shouldCancel?: () => Promise<boolean>;
}) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(options.binary, options.args, {
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
          finish(new PublicApiError("CANCELLED", "Cancellation requested.", 409));
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

export function runGhostscript(options: {
  binary: string;
  inputPath: string;
  outputPath: string;
  preset: CompressionPreset;
  timeoutMs: number;
  shouldCancel?: () => Promise<boolean>;
}) {
  return runGhostscriptWithArgs({
    binary: options.binary,
    args: buildGhostscriptArgs(options.inputPath, options.outputPath, options.preset),
    timeoutMs: options.timeoutMs,
    shouldCancel: options.shouldCancel,
  });
}
