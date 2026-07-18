import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import { validatePdfFile } from "@/lib/pdf/file-validation";
import { PdfProcessingError } from "@/lib/pdf/pdf-errors";
import { readFileBytes } from "@/lib/pdf/read-file-bytes";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

export type PdfImageExportFormat = "jpg" | "png";

export type PdfImageOutput = {
  bytes: Uint8Array;
  filename: string;
  mimeType: "image/jpeg" | "image/png";
};

function canvasToBytes(canvas: HTMLCanvasElement, mimeType: PdfImageOutput["mimeType"]) {
  return new Promise<Uint8Array>((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new PdfProcessingError("Paperlane could not create an image for this PDF page.", "PROCESSING_FAILED"));
          return;
        }

        resolve(new Uint8Array(await blob.arrayBuffer()));
      },
      mimeType,
      mimeType === "image/jpeg" ? 0.92 : undefined,
    );
  });
}

export function validatePageIndexes(pageIndexes: number[], pageCount: number) {
  if (pageCount < 1) throw new PdfProcessingError("This PDF does not contain any pages.", "EMPTY_FILE");
  if (!pageIndexes.length) throw new PdfProcessingError("Choose at least one page.", "INVALID_PAGE_RANGE");
  for (const pageIndex of pageIndexes) {
    if (pageIndex < 0 || pageIndex >= pageCount) {
      throw new PdfProcessingError(`This PDF has ${pageCount} pages. Choose pages within that range.`, "INVALID_PAGE_RANGE");
    }
  }
}

export async function pdfPagesToImages(file: File, pageIndexes: number[], format: PdfImageExportFormat) {
  validatePdfFile(file);
  if (typeof document === "undefined") {
    throw new PdfProcessingError("PDF image export needs a browser canvas.", "PROCESSING_FAILED");
  }

  const bytes = await readFileBytes(file);
  const loadingTask = pdfjsLib.getDocument({ data: bytes.slice() });
  const mimeType = format === "png" ? "image/png" : "image/jpeg";
  const extension = format === "png" ? "png" : "jpg";
  const outputs: PdfImageOutput[] = [];

  try {
    const pdf = await loadingTask.promise;
    validatePageIndexes(pageIndexes, pdf.numPages);

    for (const pageIndex of pageIndexes) {
      const page = await pdf.getPage(pageIndex + 1);
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = Math.min(2, 1800 / Math.max(baseViewport.width, baseViewport.height));
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { willReadFrequently: false });

      if (!context) throw new PdfProcessingError("Paperlane could not create an image canvas.", "PROCESSING_FAILED");

      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvas, canvasContext: context, viewport }).promise;
      outputs.push({
        bytes: await canvasToBytes(canvas, mimeType),
        filename: `paperlane-page-${pageIndex + 1}.${extension}`,
        mimeType,
      });
    }

    return outputs;
  } finally {
    await loadingTask.destroy();
  }
}
