import { degrees, PDFDocument } from "pdf-lib";
import type { RotationOption } from "@/types/processing";

const rotationDegrees: Record<RotationOption, number> = {
  "90-clockwise": 90,
  "90-counter-clockwise": -90,
  "180": 180,
};

export async function rotatePdfPages(file: File, pageIndexes: number[], rotation: RotationOption) {
  const pdf = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: false });
  const amount = rotationDegrees[rotation];

  for (const index of pageIndexes) {
    const page = pdf.getPage(index);
    const current = page.getRotation().angle;
    page.setRotation(degrees(((current + amount) % 360 + 360) % 360));
  }

  return pdf.save();
}
