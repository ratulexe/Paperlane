import { useRef, useState } from "react";
import { ContactCta } from "@/components/contact/contact-cta";
import { ContactExplanation } from "@/components/contact/contact-explanation";
import { ContactForm } from "@/components/contact/contact-form";
import { ContactHero } from "@/components/contact/contact-hero";
import { ContactOptions } from "@/components/contact/contact-options";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import type { EnquiryType } from "@/data/contact";
import { usePageMetadata } from "@/lib/use-page-metadata";

export function ContactPage() {
  const formSectionRef = useRef<HTMLDivElement>(null);
  const [selectedEnquiryType, setSelectedEnquiryType] = useState<EnquiryType>("General Enquiry");

  usePageMetadata({
    title: "Contact Paperlane",
    description: "Share product feedback, privacy questions and document-workflow ideas with Paperlane.",
  });

  const scrollToForm = () => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    formSectionRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  };

  const selectEnquiryType = (enquiryType: EnquiryType) => {
    setSelectedEnquiryType(enquiryType);
    scrollToForm();
  };

  return (
    <>
      <PageBreadcrumb current="Contact" />
      <ContactHero onSendDemoMessage={scrollToForm} />
      <ContactOptions onSelect={selectEnquiryType} />
      <section ref={formSectionRef} className="mx-auto grid w-full max-w-6xl scroll-mt-24 gap-6 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[1fr_0.72fr]">
        <ContactForm selectedEnquiryType={selectedEnquiryType} />
        <ContactExplanation />
      </section>
      <ContactCta />
    </>
  );
}
