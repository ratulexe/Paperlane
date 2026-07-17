import { PDFDocument } from "pdf-lib";
import { PdfProcessingError } from "@/lib/pdf/pdf-errors";
import type { ImagePdfMargin, ImagePdfPageSize } from "@/types/processing";

const a4Portrait: [number, number] = [595.28, 841.89];
const marginValues: Record<ImagePdfMargin, number> = {
  none: 0,
  small: 24,
  medium: 48,
};

export async function imagesToPdf(files: File[], pageSize: ImagePdfPageSize, margin: ImagePdfMargin) {
  if (!files.length) throw new PdfProcessingError("Choose at least one image.");
  if (files.length > 10) throw new PdfProcessingError("Image to PDF supports up to 10 images.");

  const pdf = await PDFDocument.create();
  const pageMargin = marginValues[margin];

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const image = file.type === "image/png" || file.name.toLowerCase().endsWith(".png")
      ? await pdf.embedPng(bytes)
      : await pdf.embedJpg(bytes);

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
