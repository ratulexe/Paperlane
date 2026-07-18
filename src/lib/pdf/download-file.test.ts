import { describe, expect, it } from "vitest";
import { createZipBlob, sanitizeFilename } from "@/lib/pdf/download-file";

function blobFromBytes(bytes: number[]) {
  const buffer = new ArrayBuffer(bytes.length);
  new Uint8Array(buffer).set(bytes);
  return new Blob([buffer]);
}

describe("sanitizeFilename", () => {
  it("removes unsafe filename characters", () => {
    expect(sanitizeFilename('bad<name>:"file"?.pdf')).toBe("bad-name---file--.pdf");
  });

  it("returns a safe fallback for empty names", () => {
    expect(sanitizeFilename("   ")).toBe("paperlane-output.pdf");
  });
});

describe("createZipBlob", () => {
  it("creates a zip archive with image filenames", async () => {
    const zip = await createZipBlob([
      { filename: "page-1.jpg", blob: blobFromBytes([1, 2, 3]) },
      { filename: "page-2.jpg", blob: blobFromBytes([4, 5, 6]) },
    ]);
    const bytes = new Uint8Array(await zip.arrayBuffer());
    const text = new TextDecoder().decode(bytes);

    expect(zip.type).toBe("application/zip");
    expect(bytes[0]).toBe(0x50);
    expect(bytes[1]).toBe(0x4b);
    expect(text).toContain("page-1.jpg");
    expect(text).toContain("page-2.jpg");
  });

  it("keeps duplicate zip entry names unique", async () => {
    const zip = await createZipBlob([
      { filename: "page.jpg", blob: blobFromBytes([1]) },
      { filename: "page.jpg", blob: blobFromBytes([2]) },
    ]);
    const text = new TextDecoder().decode(await zip.arrayBuffer());

    expect(text).toContain("page.jpg");
    expect(text).toContain("page-2.jpg");
  });
});
