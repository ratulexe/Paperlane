import { PdfProcessingError } from "@/lib/pdf/pdf-errors";

export async function readFileBytes(file: File) {
  try {
    return new Uint8Array(await file.arrayBuffer());
  } catch {
    throw new PdfProcessingError(
      `Paperlane could not read ${file.name}. If it is stored in OneDrive, Google Drive, or another cloud folder, download it locally first or choose "Always keep on this device", then try again.`,
      "FILE_READ_FAILED",
    );
  }
}
