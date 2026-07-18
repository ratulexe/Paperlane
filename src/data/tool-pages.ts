import { tools } from "@/data/tools";
import type { DocumentTool } from "@/types/tool";

export type ToolPageSpec = {
  toolId: DocumentTool["id"];
  route: string;
  title: string;
  description: string;
  badge: string;
  h1: string;
  acceptedFormats: string;
  fileLimits: string[];
  relatedToolIds: DocumentTool["id"][];
  faq: Array<{ question: string; answer: string }>;
};

const sharedFaq = [
  {
    question: "Is my file uploaded to Paperlane?",
    answer: "No. For this tool, selected file bytes are read and processed locally in browser memory and are not uploaded to a Paperlane server.",
  },
  {
    question: "Does local processing guarantee complete security?",
    answer: "No. Browser-local processing reduces server exposure, but it does not guarantee security on shared, public, untrusted or compromised devices.",
  },
];

export const toolPageSpecs = {
  "merge-pdf": {
    toolId: "merge-pdf",
    route: "/merge-pdf",
    title: "Merge PDF Files Locally | Paperlane",
    description: "Combine multiple PDF files in your chosen order directly in your browser.",
    badge: "Local merge tool",
    h1: "Merge PDF files locally.",
    acceptedFormats: "PDF files only (.pdf)",
    fileLimits: ["2 to 5 PDF files", "Maximum 50 MB per PDF", "Empty, corrupted and password-protected PDFs are rejected"],
    relatedToolIds: ["split-pdf", "reorder-pages", "rotate-pdf"],
    faq: [
      ...sharedFaq,
      {
        question: "Can I control the merge order?",
        answer: "Yes. The visible file list order is the output order, and you can move files up or down before processing.",
      },
    ],
  },
  "split-pdf": {
    toolId: "split-pdf",
    route: "/split-pdf",
    title: "Split PDF Pages Locally | Paperlane",
    description: "Extract selected PDF pages or separate every page without uploading the document.",
    badge: "Local split tool",
    h1: "Split PDF pages locally.",
    acceptedFormats: "PDF files only (.pdf)",
    fileLimits: ["One PDF file", "Maximum 50 MB", "Page ranges use one-based page numbers such as 1-3,6"],
    relatedToolIds: ["merge-pdf", "reorder-pages", "rotate-pdf"],
    faq: [
      ...sharedFaq,
      {
        question: "Can I split every page at once?",
        answer: "Yes. Paperlane creates one output per page and lets you download each output individually.",
      },
    ],
  },
  "rotate-pdf": {
    toolId: "rotate-pdf",
    route: "/rotate-pdf",
    title: "Rotate PDF Pages Locally | Paperlane",
    description: "Rotate all or selected PDF pages directly in browser memory.",
    badge: "Local rotation tool",
    h1: "Rotate PDF pages locally.",
    acceptedFormats: "PDF files only (.pdf)",
    fileLimits: ["One PDF file", "Maximum 50 MB", "Supports all pages or selected page ranges"],
    relatedToolIds: ["reorder-pages", "split-pdf", "add-watermark"],
    faq: [
      ...sharedFaq,
      {
        question: "Does Paperlane account for existing rotation?",
        answer: "Yes. New rotations are normalised against the page's existing rotation to 0, 90, 180 or 270 degrees.",
      },
    ],
  },
  "reorder-pages": {
    toolId: "reorder-pages",
    route: "/reorder-pdf",
    title: "Reorder PDF Pages Locally | Paperlane",
    description: "Change PDF page order and download a new document without a server upload.",
    badge: "Local reorder tool",
    h1: "Reorder PDF pages locally.",
    acceptedFormats: "PDF files only (.pdf)",
    fileLimits: ["One PDF file", "Maximum 50 MB", "Every source page must remain in the output exactly once"],
    relatedToolIds: ["merge-pdf", "split-pdf", "rotate-pdf"],
    faq: [
      ...sharedFaq,
      {
        question: "Can I reset to the original order?",
        answer: "Yes. Use Reset Workflow to clear the current page order and start again with the same tool.",
      },
    ],
  },
  "jpg-to-pdf": {
    toolId: "jpg-to-pdf",
    route: "/jpg-to-pdf",
    title: "Convert JPG and PNG to PDF Locally | Paperlane",
    description: "Combine JPG and PNG images into a PDF directly in your browser.",
    badge: "Local image converter",
    h1: "Convert JPG and PNG to PDF locally.",
    acceptedFormats: "JPG, JPEG and PNG images",
    fileLimits: ["1 to 10 images", "Maximum 20 MB per image", "Fit image, A4 portrait and A4 landscape page modes"],
    relatedToolIds: ["merge-pdf", "add-watermark", "pdf-to-jpg"],
    faq: [
      ...sharedFaq,
      {
        question: "Will images be stretched?",
        answer: "No. Paperlane preserves aspect ratio, centers each image and keeps it inside the selected page boundaries.",
      },
    ],
  },
  "add-watermark": {
    toolId: "add-watermark",
    route: "/add-watermark",
    title: "Add a Watermark to PDF Locally | Paperlane",
    description: "Apply a custom text watermark to all or selected PDF pages locally.",
    badge: "Local watermark tool",
    h1: "Add a PDF watermark locally.",
    acceptedFormats: "PDF files only (.pdf)",
    fileLimits: ["One PDF file", "Maximum 50 MB", "Watermark text is limited to 100 characters"],
    relatedToolIds: ["rotate-pdf", "reorder-pages", "merge-pdf"],
    faq: [
      ...sharedFaq,
      {
        question: "What font limitations apply?",
        answer: "The beta uses a standard embedded PDF font. Complex Unicode watermark text may not render as expected yet.",
      },
    ],
  },
} as const satisfies Record<string, ToolPageSpec>;

export function getToolById(toolId: DocumentTool["id"]) {
  const tool = tools.find((item) => item.id === toolId);
  if (!tool) throw new Error(`Missing Paperlane tool metadata: ${toolId}`);
  return tool;
}

export function getToolPageSpec(toolId: keyof typeof toolPageSpecs) {
  return toolPageSpecs[toolId];
}
