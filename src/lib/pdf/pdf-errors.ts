export type PdfProcessingErrorCode =
  | "INVALID_FILE_TYPE"
  | "FILE_TOO_LARGE"
  | "FILE_READ_FAILED"
  | "TOO_MANY_FILES"
  | "TOO_FEW_FILES"
  | "EMPTY_FILE"
  | "CORRUPTED_PDF"
  | "ENCRYPTED_PDF"
  | "INVALID_IMAGE"
  | "INVALID_PAGE_RANGE"
  | "INVALID_WATERMARK"
  | "MEMORY_LIMIT"
  | "PROCESSING_FAILED";

export class PdfProcessingError extends Error {
  code: PdfProcessingErrorCode;

  constructor(message: string, code: PdfProcessingErrorCode = "PROCESSING_FAILED") {
    super(message);
    this.name = "PdfProcessingError";
    this.code = code;
  }
}

export function toUserFacingPdfError(error: unknown) {
  if (error instanceof PdfProcessingError) return error.message;
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();
    if (
      name.includes("notreadable") ||
      message.includes("unknown error, read") ||
      message.includes("could not be read") ||
      message.includes("failed to read")
    ) {
      return 'Paperlane could not read the selected file. If it is stored in OneDrive, Google Drive, or another cloud folder, download it locally first or choose "Always keep on this device", then try again.';
    }
    if (message.includes("encrypted") || message.includes("password")) {
      return "This PDF appears to be encrypted or password-protected. Paperlane cannot process it locally.";
    }
    if (message.includes("jpg") || message.includes("png") || message.includes("image")) {
      return "Paperlane could not read this image. Choose a valid JPG or PNG file and try again.";
    }
    if (message.includes("invalid") || message.includes("parse") || message.includes("pdf")) {
      return "Paperlane could not read this PDF. Check that the selected file is a valid PDF and try again.";
    }
    if (message.includes("memory") || message.includes("allocation")) {
      return "This operation may require more browser memory than is currently available.";
    }
  }
  return "Paperlane could not complete this local operation. Check the selected file and try again.";
}
