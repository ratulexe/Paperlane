import type { LucideIcon } from "lucide-react";
import { Lightbulb, MessageCircle, ShieldQuestion, Wrench } from "lucide-react";

export const enquiryTypes = [
  "General Enquiry",
  "Product Feedback",
  "Privacy Question",
  "Tool Suggestion",
  "Partnership Idea",
] as const;

export type EnquiryType = (typeof enquiryTypes)[number];

export type ContactOption = {
  title: string;
  description: string;
  enquiryType: EnquiryType;
  icon: LucideIcon;
};

export const contactOptions: ContactOption[] = [
  {
    title: "General enquiries",
    description: "Ask about the Paperlane concept or website.",
    enquiryType: "General Enquiry",
    icon: MessageCircle,
  },
  {
    title: "Product feedback",
    description: "Share a usability idea or interface improvement.",
    enquiryType: "Product Feedback",
    icon: Lightbulb,
  },
  {
    title: "Privacy questions",
    description: "Ask how a future document product could communicate file handling more clearly.",
    enquiryType: "Privacy Question",
    icon: ShieldQuestion,
  },
  {
    title: "Tool suggestions",
    description: "Share a document workflow that would be useful.",
    enquiryType: "Tool Suggestion",
    icon: Wrench,
  },
];

export const contactVisualItems: EnquiryType[] = [
  "Product Feedback",
  "Privacy Question",
  "Tool Suggestion",
  "Partnership Idea",
];
