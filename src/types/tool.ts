import type { LucideIcon } from "lucide-react";

export type ToolCategory = "organise" | "convert" | "optimise" | "ai" | "security";

export type ToolStatusBadge = "popular" | "ai" | "new" | "none";
export type ToolImplementationStatus = "functional" | "concept";

export type AcceptedFileType = {
  label: string;
  extensions: string[];
  mimeTypes: string[];
};

export type ToolConfigKind =
  | "merge"
  | "split"
  | "rotate"
  | "reorder"
  | "output-format"
  | "compress"
  | "blank-pages"
  | "repair"
  | "ocr"
  | "summary"
  | "translation"
  | "extract"
  | "protect"
  | "unlock"
  | "watermark"
  | "sign";

export type DocumentTool = {
  id: string;
  name: string;
  shortDescription: string;
  detailedDescription: string;
  category: ToolCategory;
  icon: LucideIcon;
  acceptedFileTypes: AcceptedFileType[];
  badges: ToolStatusBadge[];
  workflowSteps: [string, string, string];
  availableInDemo: boolean;
  configKind: ToolConfigKind;
  implementationStatus: ToolImplementationStatus;
};

export type SelectedDemoFile = {
  id: string;
  file: File;
};

export type DemoOptionValue = string | boolean | string[];

export type DemoConfig = Record<string, DemoOptionValue>;
