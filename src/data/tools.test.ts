import { describe, expect, it } from "vitest";
import { tools } from "./tools";

describe("tool catalogue status counts", () => {
  it("publishes the promoted local, temporary cloud and coming-soon counts", () => {
    expect(tools.filter((tool) => tool.implementationStatus === "functional-local")).toHaveLength(9);
    expect(tools.filter((tool) => tool.implementationStatus === "functional-cloud")).toHaveLength(1);
    expect(tools.filter((tool) => tool.implementationStatus === "coming-soon")).toHaveLength(9);
    expect(tools.find((tool) => tool.id === "compress-pdf")).toMatchObject({
      implementationStatus: "functional-cloud",
    });
  });
});
