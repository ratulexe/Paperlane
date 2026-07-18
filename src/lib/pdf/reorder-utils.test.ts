import { describe, expect, it } from "vitest";
import { createInitialPageOrder, movePageInOrder, validatePageOrder } from "@/lib/pdf/reorder-utils";

describe("reorder utilities", () => {
  it("creates a unique initial page order", () => {
    expect(createInitialPageOrder(4)).toEqual([0, 1, 2, 3]);
  });

  it("moves pages without mutating the original order", () => {
    const order = [0, 1, 2, 3];
    expect(movePageInOrder(order, 0, 3)).toEqual([1, 2, 3, 0]);
    expect(order).toEqual([0, 1, 2, 3]);
  });

  it("rejects duplicate, missing or out-of-range pages", () => {
    expect(() => validatePageOrder([0, 1, 2], 3)).not.toThrow();
    expect(() => validatePageOrder([0, 1, 1], 3)).toThrow("duplicate");
    expect(() => validatePageOrder([0, 1], 3)).toThrow("every page");
    expect(() => validatePageOrder([0, 1, 4], 3)).toThrow("outside");
  });
});
