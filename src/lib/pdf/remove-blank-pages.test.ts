import { describe, expect, it } from "vitest";
import { getKeptPageIndexes } from "@/lib/pdf/remove-blank-pages";

describe("getKeptPageIndexes", () => {
  it("keeps pages that were not selected for removal", () => {
    expect(getKeptPageIndexes(5, [1, 3])).toEqual([0, 2, 4]);
  });

  it("requires at least one reviewed page to remove", () => {
    expect(() => getKeptPageIndexes(3, [])).toThrow("Select at least one");
  });

  it("prevents removing every page", () => {
    expect(() => getKeptPageIndexes(2, [0, 1])).toThrow("At least one page");
  });
});
