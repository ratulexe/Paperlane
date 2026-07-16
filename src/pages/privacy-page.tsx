import { ConceptNotice } from "@/components/privacy/concept-notice";
import { DataTransparency } from "@/components/privacy/data-transparency";
import { DocumentLifecycle } from "@/components/privacy/document-lifecycle";
import { PrivacyCta } from "@/components/privacy/privacy-cta";
import { PrivacyFaq } from "@/components/privacy/privacy-faq";
import { PrivacyHero } from "@/components/privacy/privacy-hero";
import { PrivacyPrinciples } from "@/components/privacy/privacy-principles";
import { ResponsibleAi } from "@/components/privacy/responsible-ai";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { usePageMetadata } from "@/lib/use-page-metadata";

export function PrivacyPage() {
  usePageMetadata({
    title: "Privacy Approach | Paperlane",
    description: "Understand the privacy principles behind Paperlane and how transparent document workflows should be designed.",
  });

  const scrollToPrinciples = () => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("privacy-principles")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  };

  return (
    <>
      <PageBreadcrumb current="Privacy" />
      <PrivacyHero onViewPrinciples={scrollToPrinciples} />
      <ConceptNotice />
      <PrivacyPrinciples />
      <DocumentLifecycle />
      <DataTransparency />
      <ResponsibleAi />
      <PrivacyFaq />
      <PrivacyCta />
    </>
  );
}
