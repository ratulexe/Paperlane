import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BadgeCheck,
  Clock3,
  EyeOff,
  FileCheck2,
  FileQuestion,
  Info,
  MessageSquareText,
  MousePointerClick,
  ScanSearch,
  ShieldCheck,
  TextSearch,
  UploadCloud,
} from "lucide-react";

export type PrivacyItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const transparentWorkflow: PrivacyItem[] = [
  { title: "File selected", description: "The interface shows what the selected file is for.", icon: FileCheck2 },
  { title: "Action explained", description: "The intended result is described before continuing.", icon: MessageSquareText },
  { title: "User confirms", description: "The user reviews choices before a workflow proceeds.", icon: MousePointerClick },
  { title: "Retention communicated", description: "Retention expectations are made visible.", icon: Clock3 },
];

export const privacyPrinciples: PrivacyItem[] = [
  {
    title: "Explain before processing",
    description: "Every action should describe its intended result before the user continues.",
    icon: MessageSquareText,
  },
  {
    title: "Collect only what is necessary",
    description: "A production tool should avoid requesting information unrelated to the chosen document action.",
    icon: FileQuestion,
  },
  {
    title: "Give users meaningful control",
    description: "Users should be able to cancel actions, remove files and understand retention choices.",
    icon: MousePointerClick,
  },
  {
    title: "Avoid hidden actions",
    description: "Uploads, analytics, storage and retention should never occur without clear communication.",
    icon: EyeOff,
  },
];

export const lifecycleStages = [
  "User selects a file",
  "Tool explains the intended action",
  "User reviews configuration choices",
  "Processing method is communicated",
  "Retention behaviour is disclosed",
];

export const transparencyRows = [
  {
    dataType: "File content",
    why: "Required only for the chosen document action.",
    approach: "Clearly communicate processing location and retention behaviour.",
    status: "Browser-local tools read selected file bytes locally. Compress PDF and Protect PDF upload only after explicit temporary cloud-processing consent when the API and worker are running.",
  },
  {
    dataType: "Cloud job metadata",
    why: "Required to queue, process, expire and delete temporary cloud-processing jobs.",
    approach: "Use random job IDs, token-gated access, timestamps, file sizes, preset, state, duration, public error category and deletion state.",
    status: "Implemented for the Compress PDF and Protect PDF temporary cloud-processing workflows; no account history is created.",
  },
  {
    dataType: "Account information",
    why: "Could support saved history or subscription features.",
    approach: "Remain optional unless required for a specific feature.",
    status: "No account system exists.",
  },
  {
    dataType: "Contact form details",
    why: "Could allow a response to a submitted enquiry.",
    approach: "Retain only for clearly stated communication purposes.",
    status: "The current form does not transmit or store information.",
  },
  {
    dataType: "Usage analytics",
    why: "Could help identify usability problems.",
    approach: "Use minimal and transparent measurement.",
    status: "No analytics integration is required for this project.",
  },
  {
    dataType: "Payment information",
    why: "Could support a future paid plan.",
    approach: "Use a specialised payment provider rather than storing card information directly.",
    status: "No payment system exists.",
  },
];

export const aiCautions: PrivacyItem[] = [
  { title: "Summaries may omit important context", description: "Condensed output should be reviewed before use.", icon: TextSearch },
  { title: "OCR may introduce recognition errors", description: "Scanned text can be misread or incomplete.", icon: ScanSearch },
  { title: "Translation may require human review", description: "Meaning and tone can change across languages.", icon: MessageSquareText },
  { title: "Extracted information may be incomplete", description: "Important details can be missed or misclassified.", icon: BadgeCheck },
  { title: "Sensitive documents require additional caution", description: "Private material needs stronger safeguards.", icon: ShieldCheck },
  { title: "Critical decisions need human judgement", description: "Automated output should not be the only source.", icon: AlertTriangle },
];

export const privacyFaqItems = [
  {
    question: "Does Paperlane upload selected files?",
    answer:
      "Browser-local tools do not upload selected files. Compress PDF and Protect PDF upload one PDF only after explicit temporary cloud-processing consent when the separate API and worker services are running.",
  },
  {
    question: "Does Paperlane store selected documents?",
    answer:
      "Paperlane does not include accounts or document history. Temporary cloud-processing inputs and outputs use configured expiration and explicit deletion controls; operational metadata may remain separately for job state and cleanup.",
  },
  {
    question: "Is Paperlane end-to-end encrypted?",
    answer: "No production encryption system has been implemented. Paperlane should not be presented as providing encrypted processing or storage.",
  },
  {
    question: "Does the contact form transmit information?",
    answer: "No. The current contact form validates inputs locally and displays a demonstration success message without transmitting or storing the submission.",
  },
  {
    question: "Are the AI tools functional?",
    answer: "No. AI workflows are represented as interface concepts only. No OCR, summarisation, translation or extraction occurs.",
  },
  {
    question: "What would a production version require?",
    answer:
      "A production version would require carefully designed document processing, security controls, privacy documentation, retention policies, infrastructure, testing and legal review.",
  },
];

export const noticeIcon = Info;
export const uploadIcon = UploadCloud;
