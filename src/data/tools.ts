import type { LucideIcon } from "lucide-react";
import {
  Archive,
  ArrowDownToLine,
  Droplets,
  FileArchive,
  FileCheck2,
  FileImage,
  FileKey2,
  FileLock2,
  FilePenLine,
  FileSearch,
  FileStack,
  FileText,
  Image,
  Languages,
  ListOrdered,
  RotateCw,
  ScanSearch,
  Scissors,
  ShieldCheck,
  Sparkles,
  TextSearch,
  Wrench,
} from "lucide-react";
import type { AcceptedFileType, DocumentTool, ToolCategory } from "@/types/tool";

export const pdfFileType: AcceptedFileType = {
  label: "PDF",
  extensions: [".pdf"],
  mimeTypes: ["application/pdf"],
};

export const wordFileType: AcceptedFileType = {
  label: "Word",
  extensions: [".doc", ".docx"],
  mimeTypes: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

export const imageFileType: AcceptedFileType = {
  label: "Image",
  extensions: [".jpg", ".jpeg", ".png"],
  mimeTypes: ["image/jpeg", "image/png"],
};

export const categoryLabels: Record<ToolCategory, string> = {
  organise: "Organise",
  convert: "Convert",
  optimise: "Optimise",
  ai: "AI Tools",
  security: "Security",
};

export const filterOptions: Array<{ value: ToolCategory | "all"; label: string }> = [
  { value: "all", label: "All Tools" },
  { value: "organise", label: "Organise" },
  { value: "convert", label: "Convert" },
  { value: "optimise", label: "Optimise" },
  { value: "ai", label: "AI Tools" },
  { value: "security", label: "Security" },
];

export const categoryOverview: Array<{
  category: ToolCategory;
  icon: LucideIcon;
  description: string;
}> = [
  { category: "organise", icon: FileStack, description: "Arrange, combine and prepare document pages." },
  { category: "convert", icon: FileArchive, description: "Explore clear conversion-oriented workflows." },
  { category: "optimise", icon: Archive, description: "Review ways to refine document output." },
  { category: "ai", icon: Sparkles, description: "Preview AI-assisted document concepts." },
  { category: "security", icon: ShieldCheck, description: "Communicate controlled document actions." },
];

export const tools: DocumentTool[] = [
  {
    id: "merge-pdf",
    name: "Merge PDF",
    shortDescription: "Combine several PDF documents into one organised file.",
    detailedDescription: "Merge selected PDF files locally in this browser without uploading them to a Paperlane server.",
    category: "organise",
    icon: FileStack,
    acceptedFileTypes: [pdfFileType],
    badges: ["popular"],
    workflowSteps: ["Select PDFs", "Arrange file order", "Merge locally"],
    availableInDemo: true,
    configKind: "merge",
    implementationStatus: "functional-local",
  },
  {
    id: "split-pdf",
    name: "Split PDF",
    shortDescription: "Separate selected PDF pages into individual documents.",
    detailedDescription: "Extract selected pages or split every page locally in this browser.",
    category: "organise",
    icon: Scissors,
    acceptedFileTypes: [pdfFileType],
    badges: ["none"],
    workflowSteps: ["Select a PDF", "Choose split option", "Create local output"],
    availableInDemo: true,
    configKind: "split",
    implementationStatus: "functional-local",
  },
  {
    id: "rotate-pdf",
    name: "Rotate PDF",
    shortDescription: "Correct the orientation of document pages.",
    detailedDescription: "Rotate all pages or selected pages locally in this browser.",
    category: "organise",
    icon: RotateCw,
    acceptedFileTypes: [pdfFileType],
    badges: ["none"],
    workflowSteps: ["Select a PDF", "Choose rotation", "Rotate locally"],
    availableInDemo: true,
    configKind: "rotate",
    implementationStatus: "functional-local",
  },
  {
    id: "reorder-pages",
    name: "Reorder Pages",
    shortDescription: "Arrange pages into a preferred sequence.",
    detailedDescription: "Reorder real PDF pages locally in this browser and prepare a new PDF download.",
    category: "organise",
    icon: ListOrdered,
    acceptedFileTypes: [pdfFileType],
    badges: ["none"],
    workflowSteps: ["Select a PDF", "Adjust page order", "Create local output"],
    availableInDemo: true,
    configKind: "reorder",
    implementationStatus: "functional-local",
  },
  {
    id: "pdf-to-word",
    name: "PDF to Word",
    shortDescription: "Present a workflow for creating an editable document.",
    detailedDescription: "Explore how a PDF-to-DOCX conversion interface could explain output choices and limitations.",
    category: "convert",
    icon: FileText,
    acceptedFileTypes: [pdfFileType],
    badges: ["popular"],
    workflowSteps: ["Select a PDF", "Review output format", "Simulate conversion workflow"],
    availableInDemo: true,
    configKind: "output-format",
    implementationStatus: "coming-soon",
  },
  {
    id: "word-to-pdf",
    name: "Word to PDF",
    shortDescription: "Prepare a document in a consistent PDF format.",
    detailedDescription: "Preview a Word-to-PDF workflow that keeps format and output expectations visible.",
    category: "convert",
    icon: FileCheck2,
    acceptedFileTypes: [wordFileType],
    badges: ["none"],
    workflowSteps: ["Select a Word document", "Review PDF output", "Simulate conversion workflow"],
    availableInDemo: true,
    configKind: "output-format",
    implementationStatus: "coming-soon",
  },
  {
    id: "jpg-to-pdf",
    name: "JPG/PNG to PDF",
    shortDescription: "Convert JPG and PNG images into a browser-local PDF.",
    detailedDescription: "Create a PDF from selected JPG or PNG images locally in this browser.",
    category: "convert",
    icon: Image,
    acceptedFileTypes: [imageFileType],
    badges: ["none"],
    workflowSteps: ["Select images", "Review PDF output", "Create local PDF"],
    availableInDemo: true,
    configKind: "output-format",
    implementationStatus: "functional-local",
  },
  {
    id: "pdf-to-jpg",
    name: "PDF to JPG/PNG",
    shortDescription: "Export selected PDF pages as JPG or PNG images.",
    detailedDescription: "Render selected PDF pages to JPG or PNG images locally in this browser.",
    category: "convert",
    icon: FileImage,
    acceptedFileTypes: [pdfFileType],
    badges: ["none"],
    workflowSteps: ["Select a PDF", "Choose image output", "Export local images"],
    availableInDemo: true,
    configKind: "output-format",
    implementationStatus: "functional-local",
  },
  {
    id: "compress-pdf",
    name: "Compress PDF",
    shortDescription: "Reduce PDF size through a temporary cloud-processing workflow.",
    detailedDescription: "Compress PDF is wired to a temporary cloud API and worker foundation with preset and target-size compression modes.",
    category: "optimise",
    icon: Archive,
    acceptedFileTypes: [pdfFileType],
    badges: ["popular"],
    workflowSteps: ["Select a PDF", "Choose compression preset", "Run temporary cloud processing"],
    availableInDemo: true,
    configKind: "compress",
    implementationStatus: "functional-cloud",
  },
  {
    id: "remove-blank-pages",
    name: "Remove Blank Pages",
    shortDescription: "Review likely blank pages and remove confirmed pages.",
    detailedDescription: "Suggest likely blank pages locally, then let the user confirm which pages to remove.",
    category: "optimise",
    icon: Droplets,
    acceptedFileTypes: [pdfFileType],
    badges: ["none"],
    workflowSteps: ["Select a PDF", "Review suggestions", "Create local output"],
    availableInDemo: true,
    configKind: "blank-pages",
    implementationStatus: "functional-local",
  },
  {
    id: "repair-pdf",
    name: "Repair PDF",
    shortDescription: "Present a workflow for checking a damaged document.",
    detailedDescription: "Show how a production repair flow could explain document-structure checks.",
    category: "optimise",
    icon: Wrench,
    acceptedFileTypes: [pdfFileType],
    badges: ["none"],
    workflowSteps: ["Select a PDF", "Review repair note", "Simulate repair workflow"],
    availableInDemo: true,
    configKind: "repair",
    implementationStatus: "coming-soon",
  },
  {
    id: "ocr-scanner",
    name: "OCR Scanner",
    shortDescription: "Demonstrate text recognition from scanned pages.",
    detailedDescription: "Preview an OCR-oriented workflow while clearly stating that no recognition is performed.",
    category: "ai",
    icon: ScanSearch,
    acceptedFileTypes: [pdfFileType, imageFileType],
    badges: ["ai"],
    workflowSteps: ["Select a scan", "Choose language", "Simulate OCR workflow"],
    availableInDemo: true,
    configKind: "ocr",
    implementationStatus: "coming-soon",
  },
  {
    id: "ai-summary",
    name: "AI Summary",
    shortDescription: "Preview a concise summary-oriented document workflow.",
    detailedDescription: "Explore summary length choices while keeping AI limitations visible.",
    category: "ai",
    icon: Sparkles,
    acceptedFileTypes: [pdfFileType, wordFileType],
    badges: ["ai"],
    workflowSteps: ["Select a document", "Choose summary length", "Simulate summary workflow"],
    availableInDemo: true,
    configKind: "summary",
    implementationStatus: "coming-soon",
  },
  {
    id: "ai-translation",
    name: "AI Translation",
    shortDescription: "Present a document translation workflow with clear limitations.",
    detailedDescription: "Preview source and target language choices without performing translation.",
    category: "ai",
    icon: Languages,
    acceptedFileTypes: [pdfFileType, wordFileType],
    badges: ["ai"],
    workflowSteps: ["Select a document", "Choose languages", "Simulate translation workflow"],
    availableInDemo: true,
    configKind: "translation",
    implementationStatus: "coming-soon",
  },
  {
    id: "key-information-extractor",
    name: "Key Information Extractor",
    shortDescription: "Highlight names, dates and important document details.",
    detailedDescription: "Explore extraction categories while making human review expectations clear.",
    category: "ai",
    icon: TextSearch,
    acceptedFileTypes: [pdfFileType, wordFileType],
    badges: ["ai"],
    workflowSteps: ["Select a document", "Choose detail categories", "Simulate extraction workflow"],
    availableInDemo: true,
    configKind: "extract",
    implementationStatus: "coming-soon",
  },
  {
    id: "protect-pdf",
    name: "Protect PDF",
    shortDescription: "Present password-protection choices before processing.",
    detailedDescription: "Preview password-entry controls for a future document-protection workflow.",
    category: "security",
    icon: FileLock2,
    acceptedFileTypes: [pdfFileType],
    badges: ["none"],
    workflowSteps: ["Select a PDF", "Enter demo password", "Simulate protection workflow"],
    availableInDemo: true,
    configKind: "protect",
    implementationStatus: "coming-soon",
  },
  {
    id: "unlock-pdf",
    name: "Unlock PDF",
    shortDescription: "Demonstrate an authorised password-removal workflow.",
    detailedDescription: "Explore an unlock interface that reminds users to modify only authorised documents.",
    category: "security",
    icon: FileKey2,
    acceptedFileTypes: [pdfFileType],
    badges: ["none"],
    workflowSteps: ["Select a PDF", "Enter demo password", "Simulate unlock workflow"],
    availableInDemo: true,
    configKind: "unlock",
    implementationStatus: "coming-soon",
  },
  {
    id: "add-watermark",
    name: "Add Watermark",
    shortDescription: "Add text watermarks to selected PDF pages.",
    detailedDescription: "Add text watermarks to selected PDF pages locally in this browser.",
    category: "security",
    icon: FilePenLine,
    acceptedFileTypes: [pdfFileType],
    badges: ["none"],
    workflowSteps: ["Select a PDF", "Choose watermark placement", "Create local output"],
    availableInDemo: true,
    configKind: "watermark",
    implementationStatus: "functional-local",
  },
  {
    id: "sign-document",
    name: "Visual Sign PDF",
    shortDescription: "Add a visual electronic signature to a selected page.",
    detailedDescription: "Draw, type or upload a visual electronic signature and place it on a PDF locally.",
    category: "security",
    icon: FileSearch,
    acceptedFileTypes: [pdfFileType],
    badges: ["none"],
    workflowSteps: ["Select a PDF", "Create signature", "Place visual signature"],
    availableInDemo: true,
    configKind: "sign",
    implementationStatus: "functional-local",
  },
];

export type HomepageToolCategory = "Organise" | "Optimise" | "Convert" | "AI Tool";

export type PopularTool = {
  name: string;
  category: HomepageToolCategory;
  description: string;
  icon: LucideIcon;
  popular?: boolean;
  ai?: boolean;
};

const homepageToolIds = ["merge-pdf", "compress-pdf", "pdf-to-word", "jpg-to-pdf", "ocr-scanner", "ai-summary"];

function toHomepageCategory(category: ToolCategory): HomepageToolCategory {
  if (category === "organise") return "Organise";
  if (category === "optimise") return "Optimise";
  if (category === "convert") return "Convert";
  return "AI Tool";
}

export const popularTools: PopularTool[] = homepageToolIds.map((id) => {
  const tool = tools.find((item) => item.id === id);
  if (!tool) throw new Error(`Missing homepage tool: ${id}`);
  return {
    name: tool.name,
    category: toHomepageCategory(tool.category),
    description:
      id === "merge-pdf"
        ? "Bring related pages together in one clear workflow."
        : id === "compress-pdf"
          ? "Preview a smaller sharing workflow without clutter."
          : id === "pdf-to-word"
            ? "Explore how conversion steps could be presented."
            : id === "jpg-to-pdf"
              ? "Turn image-based paperwork into an organised flow."
              : id === "ocr-scanner"
                ? "Demonstrate an OCR-oriented workflow for scans."
                : "Preview how longer content could become easier to review.",
    icon: tool.icon,
    popular: tool.badges.includes("popular"),
    ai: tool.badges.includes("ai"),
  };
});

export const sidebarItems = ["Overview", "All Documents", "Organise", "Convert", "AI Tools", "Privacy"];

export const dashboardRows = [
  { document: "Proposal.pdf", workflow: "Merge PDF", status: "Local", updated: "Just now", icon: FileText },
  { document: "Research.pdf", workflow: "AI Summary", status: "Concept", updated: "4 min ago", icon: Sparkles },
  { document: "Receipts.zip", workflow: "Compress PDF", status: "Concept", updated: "12 min ago", icon: ArrowDownToLine },
] as const;
