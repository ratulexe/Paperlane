import type { LucideIcon } from "lucide-react";
import {
  CheckCircle2,
  CircleDot,
  Eye,
  FileCheck2,
  FileSearch,
  Layers3,
  MousePointer2,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  TextSearch,
} from "lucide-react";

export type RecentDocument = {
  fileName: string;
  lastAction: string;
  status: "Ready" | "Draft" | "Demo";
};

export type AiAction = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type ProcessStep = {
  number: string;
  title: string;
  description: string;
};

export type Principle = {
  title: string;
  icon: LucideIcon;
};

export type Benefit = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type ConceptStory = {
  role: string;
  initials: string;
  quote: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const supportPoints = ["Clear workflows", "Browser-local tools", "No unnecessary complexity"];

export const recentDocuments: RecentDocument[] = [
  { fileName: "Project brief.pdf", lastAction: "Compressed", status: "Ready" },
  { fileName: "Research notes.docx", lastAction: "Organised", status: "Draft" },
  { fileName: "Receipt scan.jpg", lastAction: "OCR concept", status: "Demo" },
];

export const aiActions: AiAction[] = [
  {
    title: "Summarise document",
    description: "Create a concise overview of longer content.",
    icon: Sparkles,
  },
  {
    title: "Extract key details",
    description: "Identify names, dates and important information.",
    icon: TextSearch,
  },
  {
    title: "Recognise scanned text",
    description: "Demonstrate an OCR-oriented workflow.",
    icon: ScanSearch,
  },
];

export const processSteps: ProcessStep[] = [
  {
    number: "01",
    title: "Choose a tool",
    description: "Select a functional local tool or a clearly labelled concept preview.",
  },
  {
    number: "02",
    title: "Add your document",
    description: "Supported tools read the file locally in browser memory.",
  },
  {
    number: "03",
    title: "Configure the action",
    description: "Choose page ranges, order, rotation, watermark or output settings.",
  },
  {
    number: "04",
    title: "Download or preview",
    description: "Functional tools create a real local output. Concept workflows stop after the interface preview.",
  },
];

export const privacyPrinciples: Principle[] = [
  { title: "Explain before processing", icon: Eye },
  { title: "Request only what is necessary", icon: FileCheck2 },
  { title: "Keep users in control", icon: MousePointer2 },
  { title: "Avoid hidden actions", icon: ShieldCheck },
];

export const benefits: Benefit[] = [
  {
    title: "Consistent workflows",
    description: "Every tool follows a familiar structure.",
    icon: Layers3,
  },
  {
    title: "Focused interface",
    description: "The user sees only what is relevant to the selected action.",
    icon: CircleDot,
  },
  {
    title: "Responsible AI concepts",
    description: "AI-assisted workflows clearly communicate their limitations.",
    icon: FileSearch,
  },
  {
    title: "Responsive by design",
    description: "The interface remains usable across desktop and mobile devices.",
    icon: CheckCircle2,
  },
];

export const conceptStories: ConceptStory[] = [
  {
    role: "Student",
    initials: "ST",
    quote: "I need one clear place for combining assignment pages and preparing them for submission.",
  },
  {
    role: "Freelancer",
    initials: "FR",
    quote: "I want document tools that explain what will happen before I select a client file.",
  },
  {
    role: "Small business owner",
    initials: "SB",
    quote: "I need repeatable workflows for invoices, forms and scanned paperwork.",
  },
];

export const faqItems: FaqItem[] = [
  {
    question: "What is Paperlane?",
    answer: "Paperlane is a frontend product concept exploring a clearer, more consistent document productivity experience.",
  },
  {
    question: "Does Paperlane process real documents?",
    answer:
      "Nine PDF tools process selected files locally in your browser. The remaining tools are clearly labelled coming-soon workflows and do not create output files.",
  },
  {
    question: "Which document tools are represented?",
    answer:
      "Paperlane includes 19 workflows across organisation, conversion, optimisation, security and AI-assisted categories, with nine currently functional in the browser.",
  },
  {
    question: "Is an account required?",
    answer: "No account system exists in the current frontend demonstration.",
  },
  {
    question: "Is Paperlane free?",
    answer: "No production pricing or payment system has been implemented. Any future pricing shown would be part of the product concept.",
  },
  {
    question: "How does Paperlane approach privacy?",
    answer: "The design focuses on explaining actions clearly, minimising unnecessary data collection and giving users visible control over document workflows.",
  },
];
