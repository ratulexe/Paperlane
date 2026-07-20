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
  ENCRYPTED_PDF: "Password-protected PDFs are not supported for this operation.",
  UPLOAD_FAILED: "Paperlane could not complete the upload.",
  JOB_NOT_FOUND: "This cloud job was not found.",
  JOB_EXPIRED: "This cloud job has expired.",
  JOB_ALREADY_STARTED: "This cloud job has already started.",
  RATE_LIMITED: "Too many cloud-processing requests. Wait before trying again.",
  QUEUE_UNAVAILABLE: "The cloud-processing queue is not available.",
  PROCESSING_TIMEOUT: "Cloud processing took too long and was stopped.",
  COMPRESSION_FAILED: "Paperlane could not compress this PDF.",
  PROTECTION_FAILED: "Paperlane could not protect this PDF.",
  INVALID_PASSWORD: "Enter a valid PDF password.",
  PASSWORD_TOO_SHORT: "Enter a password with at least 6 characters.",
  PASSWORD_TOO_LONG: "Use a password with 128 characters or fewer.",
  OUTPUT_INVALID: "The generated output did not pass validation.",
  STORAGE_FAILED: "Temporary storage is not available.",
  DOWNLOAD_EXPIRED: "This download has expired.",
  UNAUTHORISED_JOB: "This cloud job cannot be accessed with the provided token.",
  INVALID_STATE: "This cloud job is not ready for that action.",
  CANCELLED: "This cloud job was cancelled.",
  INVALID_TARGET_SIZE: "Enter a valid target size.",
  TARGET_TOO_SMALL: "Enter a target of at least 50 KB.",
  TARGET_TOO_LARGE: "Choose a target below the configured maximum.",
  TARGET_NOT_SMALLER_THAN_ORIGINAL: "The selected target must be smaller than the original PDF.",
  TARGET_NOT_REACHED: "Paperlane could not make this PDF smaller with the selected target. Try a less aggressive target or use the original file.",
  OUTPUT_PAGE_COUNT_MISMATCH: "The generated output did not preserve the original page count.",
  INTERNAL_ERROR: "Paperlane could not complete this cloud operation.",
};

export function publicMessage(category: PublicErrorCategory) {
  return publicErrorMessages[category];
}
