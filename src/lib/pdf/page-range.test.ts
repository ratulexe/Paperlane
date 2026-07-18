import { describe, expect, it } from "vitest";
import { parsePageRange } from "@/lib/pdf/page-range";

describe("parsePageRange", () => {
  it.each([
    ["1", [0]],
    ["1-3", [0, 1, 2]],
    ["1,3,5", [0, 2, 4]],
    ["1-3,5", [0, 1, 2, 4]],
    ["1-3,6,8-10", [0, 1, 2, 5, 7, 8, 9]],
    ["3,1,2", [2, 0, 1]],
    [" 1 , 1 , 2 ", [0, 1]],
  ])("parses %s", (input, expected) => {
    expect(parsePageRange(input, 10)).toEqual(expected);
  });

  it.each(["", "0", "-1", "1,,2", "3-1", "1-", "abc", "11"])("rejects invalid input %s", (input) => {
    expect(() => parsePageRange(input, 10)).toThrow();
  });
});
