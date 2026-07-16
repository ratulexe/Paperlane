import type { LucideIcon } from "lucide-react";
import {
  Archive,
  ArrowDownToLine,
  FileStack,
  FileText,
  Image,
  ScanSearch,
  Sparkles,
} from "lucide-react";

export type ToolCategory = "Organise" | "Optimise" | "Convert" | "AI Tool";

export type PopularTool = {
  name: string;
  category: ToolCategory;
  description: string;
  icon: LucideIcon;
  popular?: boolean;
  ai?: boolean;
};

export const popularTools: PopularTool[] = [
  {
    name: "Merge PDF",
    category: "Organise",
    description: "Bring related pages together in one clear workflow.",
    icon: FileStack,
    popular: true,
  },
  {
    name: "Compress PDF",
    category: "Optimise",
    description: "Preview a smaller sharing workflow without clutter.",
    icon: Archive,
    popular: true,
  },
  {
    name: "PDF to Word",
    category: "Convert",
    description: "Explore how conversion steps could be presented.",
    icon: FileText,
  },
  {
    name: "JPG to PDF",
    category: "Convert",
    description: "Turn image-based paperwork into an organised flow.",
    icon: Image,
  },
  {
    name: "OCR Scanner",
    category: "AI Tool",
    description: "Demonstrate an OCR-oriented workflow for scans.",
    icon: ScanSearch,
    ai: true,
  },
  {
    name: "AI Summary",
    category: "AI Tool",
    description: "Preview how longer content could become easier to review.",
    icon: Sparkles,
    ai: true,
  },
];

export const sidebarItems = ["Overview", "All Documents", "Organise", "Convert", "AI Tools", "Privacy"];

export const dashboardRows = [
  { document: "Proposal.pdf", workflow: "Merge", status: "Ready", updated: "Just now", icon: FileText },
  { document: "Research.pdf", workflow: "AI Summary", status: "Demo", updated: "4 min ago", icon: Sparkles },
  { document: "Receipts.zip", workflow: "Compress", status: "Queued", updated: "12 min ago", icon: ArrowDownToLine },
] as const;
