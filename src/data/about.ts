import type { LucideIcon } from "lucide-react";
import {
  Accessibility,
  BrainCircuit,
  CheckCircle2,
  CircleHelp,
  Eye,
  FileWarning,
  Focus,
  PanelsTopLeft,
  Repeat2,
  ShieldCheck,
  Workflow,
} from "lucide-react";

export type AboutCardItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type JourneyStage = {
  number: string;
  title: string;
  description: string;
};

export const documentProblems: AboutCardItem[] = [
  {
    title: "Too many separate tools",
    description: "Users often move between several websites to complete one document task.",
    icon: PanelsTopLeft,
  },
  {
    title: "Confusing interfaces",
    description: "Technical terminology and inconsistent layouts make simple actions harder to understand.",
    icon: CircleHelp,
  },
  {
    title: "Unclear file handling",
    description: "Users may not know whether a document is uploaded, stored or retained.",
    icon: FileWarning,
  },
  {
    title: "Repetitive workflows",
    description: "Common actions frequently involve unnecessary steps and repeated setup.",
    icon: Repeat2,
  },
];

export const paperlaneChecklist = [
  "Clear actions before file selection",
  "Consistent tool layouts",
  "Visible frontend-only notices",
  "Accessible controls",
  "Responsible AI limitations",
  "Responsive interaction design",
];

export const missionVision = [
  {
    title: "Mission",
    description: "Make document workflows easier to understand, faster to navigate and more approachable for everyday users.",
    icon: Workflow,
  },
  {
    title: "Vision",
    description:
      "Explore a document workspace where users always understand the intended action, the role of their file and the limits of automated assistance.",
    icon: ShieldCheck,
  },
];

export const designPrinciples: AboutCardItem[] = [
  {
    title: "Simplicity",
    description: "Interfaces should reduce unnecessary decisions and make the next action clear.",
    icon: Focus,
  },
  {
    title: "Transparency",
    description: "Document tools should explain what an action intends to do before it begins.",
    icon: Eye,
  },
  {
    title: "Accessibility",
    description: "The experience should remain usable with keyboards, assistive technology and small screens.",
    icon: Accessibility,
  },
  {
    title: "Responsible AI",
    description: "Automated assistance should communicate uncertainty and encourage human review.",
    icon: BrainCircuit,
  },
];

export const productJourney: JourneyStage[] = [
  {
    number: "01",
    title: "Identify the friction",
    description: "Study where common document tasks feel confusing or repetitive.",
  },
  {
    number: "02",
    title: "Design the workflow",
    description: "Create a consistent path from selecting a tool to reviewing an action.",
  },
  {
    number: "03",
    title: "Build the experience",
    description: "Use reusable components, accessible controls and responsive layouts.",
  },
  {
    number: "04",
    title: "Explore future functionality",
    description: "Consider how real local or secure document processing could later be added.",
  },
];

export const workflowStages = ["Document selected", "Action explained", "Workflow reviewed"];
export const checklistIcon = CheckCircle2;
