import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { validatePdfFile } from "@/lib/pdf/file-validation";
import { PdfProcessingError } from "@/lib/pdf/pdf-errors";
import { readFileBytes } from "@/lib/pdf/read-file-bytes";
import { calculateWatermarkPosition } from "@/lib/pdf/watermark-layout";
import type { WatermarkPosition } from "@/types/processing";

export type VisualSignatureInput =
  | { kind: "typed"; text: string }
  | { kind: "image"; bytes: Uint8Array; mimeType: string };

export type VisualSignatureOptions = {
  pageIndex: number;
  position: WatermarkPosition;
  widthPercent: number;
  input: VisualSignatureInput;
};

function validateSignaturePage(pageIndex: number, pageCount: number) {
  if (pageIndex < 0 || pageIndex >= pageCount) {
    throw new PdfProcessingError(`This PDF has ${pageCount} pages. Choose pages within that range.`, "INVALID_PAGE_RANGE");
  }
}

export async function visualSignPdf(file: File, options: VisualSignatureOptions) {
  validatePdfFile(file);
  const pdf = await PDFDocument.load(await readFileBytes(file), { ignoreEncryption: false });
  validateSignaturePage(options.pageIndex, pdf.getPageCount());

  const page = pdf.getPage(options.pageIndex);
  const { width: pageWidth, height: pageHeight } = page.getSize();
  const targetWidth = Math.min(Math.max(options.widthPercent, 12), 60) / 100 * pageWidth;
  const padding = 36;

  if (options.input.kind === "typed") {
    const text = options.input.text.trim();
    if (!text) throw new PdfProcessingError("Enter signature text before processing.", "INVALID_WATERMARK");

    const font = await pdf.embedFont(StandardFonts.TimesRomanItalic);
    const fontSize = Math.min(Math.max(targetWidth / Math.max(text.length * 0.42, 1), 18), 72);
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);
    const { x, y } = calculateWatermarkPosition({
      pageWidth,
      pageHeight,
      textWidth,
      textHeight,
      position: options.position,
      padding,
    });

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.06, 0.08, 0.14),
    });
  } else {
    const image = options.input.mimeType.includes("png")
      ? await pdf.embedPng(options.input.bytes).catch(() => {
        throw new PdfProcessingError("Paperlane could not read this signature PNG.", "INVALID_IMAGE");
      })
      : await pdf.embedJpg(options.input.bytes).catch(() => {
        throw new PdfProcessingError("Paperlane could not read this signature image. Use a JPG or PNG file.", "INVALID_IMAGE");
      });
    const targetHeight = targetWidth * (image.height / image.width);
    const { x, y } = calculateWatermarkPosition({
      pageWidth,
      pageHeight,
      textWidth: targetWidth,
      textHeight: targetHeight,
      position: options.position,
      padding,
    });

    page.drawImage(image, {
      x,
      y,
      width: targetWidth,
      height: targetHeight,
    });
  }

  return pdf.save();
}
