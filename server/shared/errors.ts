import type { PublicErrorCategory } from "./types.js";

export class PublicApiError extends Error {
  constructor(
    public readonly category: PublicErrorCategory,
    message: string,
    public readonly statusCode = 400,
  ) {
    super(message);
  }
}

export const publicErrorMessages: Record<PublicErrorCategory, string> = {
  INVALID_FILE_TYPE: "Choose a valid PDF file.",
  FILE_TOO_LARGE: "This PDF is larger than the configured upload limit.",
  EMPTY_FILE: "Choose a non-empty PDF file.",
  INVALID_PDF: "Paperlane could not read this PDF.",
  ENCRYPTED_PDF: "Password-protected PDFs are not supported for compression.",
  UPLOAD_FAILED: "Paperlane could not complete the upload.",
  JOB_NOT_FOUND: "This compression job was not found.",
  JOB_EXPIRED: "This compression job has expired.",
  JOB_ALREADY_STARTED: "This compression job has already started.",
  RATE_LIMITED: "Too many compression requests. Wait before trying again.",
  QUEUE_UNAVAILABLE: "The compression queue is not available.",
  PROCESSING_TIMEOUT: "Compression took too long and was stopped.",
  COMPRESSION_FAILED: "Paperlane could not compress this PDF.",
  OUTPUT_INVALID: "The compressed output did not pass validation.",
  STORAGE_FAILED: "Temporary storage is not available.",
  DOWNLOAD_EXPIRED: "This download has expired.",
  UNAUTHORISED_JOB: "This compression job cannot be accessed with the provided token.",
  INVALID_STATE: "This compression job is not ready for that action.",
  INTERNAL_ERROR: "Paperlane could not complete this cloud operation.",
};

export function publicMessage(category: PublicErrorCategory) {
  return publicErrorMessages[category];
}
