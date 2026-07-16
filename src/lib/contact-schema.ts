import { z } from "zod";
import { enquiryTypes } from "@/data/contact";

export const contactFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter at least 2 characters.")
    .max(80, "Use 80 characters or fewer."),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(120, "Use 120 characters or fewer."),
  enquiryType: z.enum(enquiryTypes, {
    error: "Choose an enquiry type.",
  }),
  subject: z
    .string()
    .trim()
    .min(3, "Enter at least 3 characters.")
    .max(120, "Use 120 characters or fewer."),
  message: z
    .string()
    .trim()
    .min(20, "Enter at least 20 characters.")
    .max(1500, "Use 1500 characters or fewer."),
  consent: z.boolean().refine((value) => value, {
    message: "Confirm that this demonstration form will not transmit or store the message.",
  }),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const defaultContactValues: ContactFormValues = {
  fullName: "",
  email: "",
  enquiryType: "General Enquiry",
  subject: "",
  message: "",
  consent: false,
};
