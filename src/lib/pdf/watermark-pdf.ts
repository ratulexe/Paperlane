import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { validatePdfFile } from "@/lib/pdf/file-validation";
import { PdfProcessingError } from "@/lib/pdf/pdf-errors";
import { readFileBytes } from "@/lib/pdf/read-file-bytes";
import { calculateWatermarkPosition } from "@/lib/pdf/watermark-layout";
import type { WatermarkPosition } from "@/types/processing";

type WatermarkOptions = {
  text: string;
  fontSize: number;
  opacity: number;
  position: WatermarkPosition;
  pageIndexes: number[];
};

export async function watermarkPdf(file: File, options: WatermarkOptions) {
  validatePdfFile(file);
  const text = options.text.trim();
  if (!text) throw new PdfProcessingError("Enter watermark text before processing.", "INVALID_WATERMARK");
  if (text.length > 100) throw new PdfProcessingError("Watermark text must be 100 characters or fewer.", "INVALID_WATERMARK");

  const pdf = await PDFDocument.load(await readFileBytes(file), { ignoreEncryption: false });
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontSize = Math.min(Math.max(options.fontSize, 12), 96);
  const opacity = Math.min(Math.max(options.opacity, 0.1), 1);
  const textWidth = font.widthOfTextAtSize(text, fontSize);
  const textHeight = font.heightAtSize(fontSize);
  const padding = 32;

  for (const index of options.pageIndexes) {
    const page = pdf.getPage(index);
    const { width, height } = page.getSize();
    const { x, y } = calculateWatermarkPosition({
      pageWidth: width,
      pageHeight: height,
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
      color: rgb(0.37, 0.23, 0.82),
      opacity,
    });
  }

  return pdf.save();
}
