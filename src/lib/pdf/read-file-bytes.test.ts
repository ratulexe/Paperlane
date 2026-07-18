import { describe, expect, it } from "vitest";
import { PdfProcessingError } from "@/lib/pdf/pdf-errors";
import { readFileBytes } from "@/lib/pdf/read-file-bytes";

describe("readFileBytes", () => {
  it("returns file bytes", async () => {
    const file = new File([new Uint8Array([1, 2, 3])], "sample.pdf", { type: "application/pdf" });

    await expect(readFileBytes(file)).resolves.toEqual(new Uint8Array([1, 2, 3]));
  });

  it("names unreadable cloud-placeholder files", async () => {
    const file = new File([], "cloud.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "arrayBuffer", {
      value: () => Promise.reject(new Error("UNKNOWN: unknown error, read")),
    });

    await expect(readFileBytes(file)).rejects.toMatchObject({
      code: "FILE_READ_FAILED",
      message: expect.stringContaining("cloud.pdf"),
    } satisfies Partial<PdfProcessingError>);
  });
});
