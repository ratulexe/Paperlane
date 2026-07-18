import { degrees, PDFDocument } from "pdf-lib";
import { validatePdfFile } from "@/lib/pdf/file-validation";
import { readFileBytes } from "@/lib/pdf/read-file-bytes";
import { getNextRotationDegrees } from "@/lib/pdf/rotation-utils";
import type { RotationOption } from "@/types/processing";

export async function rotatePdfPages(file: File, pageIndexes: number[], rotation: RotationOption) {
  validatePdfFile(file);
  const pdf = await PDFDocument.load(await readFileBytes(file), { ignoreEncryption: false });

  for (const index of pageIndexes) {
    const page = pdf.getPage(index);
    const current = page.getRotation().angle;
    page.setRotation(degrees(getNextRotationDegrees(current, rotation)));
  }

  return pdf.save();
}
