import { ParseSpeeds, PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import { validateMergeFiles } from "@/lib/pdf/file-validation";
import { PdfProcessingError } from "@/lib/pdf/pdf-errors";
import { readFileBytes } from "@/lib/pdf/read-file-bytes";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

const pdfLoadOptions = {
  ignoreEncryption: false,
  parseSpeed: ParseSpeeds.Fastest,
  throwOnInvalidObject: false,
  updateMetadata: false,
};

function isPasswordProtectedError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return message.includes("encrypted") || message.includes("password");
}

function createUnreadablePdfError(fileName: string, error: unknown) {
  if (isPasswordProtectedError(error)) {
    return new PdfProcessingError(`${fileName} appears to be encrypted or password-protected. Paperlane cannot process it locally.`, "ENCRYPTED_PDF");
  }

  return new PdfProcessingError(
    `Paperlane could not read ${fileName}. Try opening it, printing or exporting it as a new PDF, then upload the new copy.`,
    "CORRUPTED_PDF",
  );
}

function canvasToArrayBuffer(canvas: HTMLCanvasElement) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob.arrayBuffer());
        else reject(new PdfProcessingError("Paperlane could not render this PDF page.", "PROCESSING_FAILED"));
      },
      "image/jpeg",
      0.9,
    );
  });
}

async function appendCopiedPdfPages(merged: PDFDocument, file: File, bytes: Uint8Array) {
  const source = await PDFDocument.load(bytes, pdfLoadOptions);
  const pageCount = source.getPageCount();
  if (pageCount < 1) throw new PdfProcessingError(`${file.name} does not contain any pages.`, "EMPTY_FILE");
  const pages = await merged.copyPages(source, source.getPageIndices());
  for (const page of pages) merged.addPage(page);
}

async function appendRenderedPdfPages(merged: PDFDocument, file: File, bytes: Uint8Array, originalError: unknown) {
  if (typeof document === "undefined") throw createUnreadablePdfError(file.name, originalError);

  const loadingTask = pdfjsLib.getDocument({ data: bytes.slice() });

  try {
    const pdf = await loadingTask.promise;
    if (pdf.numPages < 1) throw new PdfProcessingError(`${file.name} does not contain any pages.`, "EMPTY_FILE");

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const sourcePage = await pdf.getPage(pageNumber);
      const baseViewport = sourcePage.getViewport({ scale: 1 });
      const renderScale = Math.min(1.6, 1600 / Math.max(baseViewport.width, baseViewport.height));
      const viewport = sourcePage.getViewport({ scale: renderScale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) throw new PdfProcessingError("Paperlane could not render this PDF page.", "PROCESSING_FAILED");

      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      await sourcePage.render({ canvas, canvasContext: context, viewport }).promise;

      const pageImage = await merged.embedJpg(await canvasToArrayBuffer(canvas));
      const outputPage = merged.addPage([baseViewport.width, baseViewport.height]);
      outputPage.drawImage(pageImage, {
        x: 0,
        y: 0,
        width: baseViewport.width,
        height: baseViewport.height,
      });
    }
  } catch (fallbackError) {
    throw fallbackError instanceof PdfProcessingError ? fallbackError : createUnreadablePdfError(file.name, originalError);
  } finally {
    await loadingTask.destroy();
  }
}

export async function mergePdfFiles(files: File[]) {
  validateMergeFiles(files);

  const merged = await PDFDocument.create();

  for (const file of files) {
    const bytes = await readFileBytes(file);

    try {
      await appendCopiedPdfPages(merged, file, bytes);
    } catch (copyError) {
      if (isPasswordProtectedError(copyError)) throw createUnreadablePdfError(file.name, copyError);
      await appendRenderedPdfPages(merged, file, bytes, copyError);
    }
  }

  return merged.save();
}
