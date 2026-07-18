import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { visualSignPdf } from "@/lib/pdf/visual-sign-pdf";

async function samplePdfFile() {
  const pdf = await PDFDocument.create();
  pdf.addPage([300, 220]);
  const bytes = await pdf.save();
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return new File([buffer], "sample.pdf", { type: "application/pdf" });
}

describe("visualSignPdf", () => {
  it("adds a typed visual signature", async () => {
    const signedBytes = await visualSignPdf(await samplePdfFile(), {
      pageIndex: 0,
      position: "bottom-right",
      widthPercent: 30,
      input: { kind: "typed", text: "Ratul" },
    });
    const signedPdf = await PDFDocument.load(signedBytes);

    expect(signedPdf.getPageCount()).toBe(1);
    expect(signedBytes.byteLength).toBeGreaterThan(500);
  });

  it("requires signature text", async () => {
    await expect(
      visualSignPdf(await samplePdfFile(), {
        pageIndex: 0,
        position: "centre",
        widthPercent: 30,
        input: { kind: "typed", text: " " },
      }),
    ).rejects.toThrow("Enter signature text");
  });
});
