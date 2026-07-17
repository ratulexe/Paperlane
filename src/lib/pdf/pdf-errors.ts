export class PdfProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfProcessingError";
  }
}

export function toUserFacingPdfError(error: unknown) {
  if (error instanceof PdfProcessingError) return error.message;
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("encrypted") || message.includes("password")) {
      return "This PDF appears to be encrypted or password-protected. Paperlane cannot process it locally.";
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
