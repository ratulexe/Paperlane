import { PDFDocument } from "pdf-lib";
import { validateImageFiles } from "@/lib/pdf/file-validation";
import { PdfProcessingError } from "@/lib/pdf/pdf-errors";
import { readFileBytes } from "@/lib/pdf/read-file-bytes";
import type { ImagePdfMargin, ImagePdfPageSize } from "@/types/processing";

const a4Portrait: [number, number] = [595.28, 841.89];
const marginValues: Record<ImagePdfMargin, number> = {
  none: 0,
  small: 24,
  medium: 48,
};

export async function imagesToPdf(files: File[], pageSize: ImagePdfPageSize, margin: ImagePdfMargin) {
  validateImageFiles(files);

  const pdf = await PDFDocument.create();
  const pageMargin = marginValues[margin];

  for (const file of files) {
    const bytes = await readFileBytes(file);
    const image = file.type === "image/png" || file.name.toLowerCase().endsWith(".png")
      ? await pdf.embedPng(bytes).catch(() => {
        throw new PdfProcessingError("Paperlane could not read this PNG image.", "INVALID_IMAGE");
      })
      : await pdf.embedJpg(bytes).catch(() => {
        throw new PdfProcessingError("Paperlane could not read this JPEG image.", "INVALID_IMAGE");
      });

    const [pageWidth, pageHeight] =
      pageSize === "fit"
        ? [image.width + pageMargin * 2, image.height + pageMargin * 2]
        : pageSize === "a4-landscape"
          ? [a4Portrait[1], a4Portrait[0]]
          : a4Portrait;

    const page = pdf.addPage([pageWidth, pageHeight]);
    const availableWidth = Math.max(pageWidth - pageMargin * 2, 1);
    const availableHeight = Math.max(pageHeight - pageMargin * 2, 1);
    const scale = Math.min(availableWidth / image.width, availableHeight / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    page.drawImage(image, {
      x: (pageWidth - width) / 2,
      y: (pageHeight - height) / 2,
      width,
      height,
    });
  }

  return pdf.save();
}
