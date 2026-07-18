import type { DocumentTool } from "@/types/tool";

export const functionalToolRoutes = {
  "merge-pdf": "/merge-pdf",
  "split-pdf": "/split-pdf",
  "rotate-pdf": "/rotate-pdf",
  "reorder-pages": "/reorder-pdf",
  "jpg-to-pdf": "/jpg-to-pdf",
  "pdf-to-jpg": "/pdf-to-jpg",
  "remove-blank-pages": "/remove-blank-pages",
  "add-watermark": "/add-watermark",
  "sign-document": "/visual-sign-pdf",
} as const satisfies Partial<Record<DocumentTool["id"], string>>;

export function getFunctionalToolRoute(tool: DocumentTool) {
  if (tool.implementationStatus !== "functional") return undefined;
  return Object.prototype.hasOwnProperty.call(functionalToolRoutes, tool.id)
    ? functionalToolRoutes[tool.id as keyof typeof functionalToolRoutes]
    : undefined;
}
