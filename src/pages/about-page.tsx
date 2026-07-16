import { AboutCta } from "@/components/about/about-cta";
import { AboutHero } from "@/components/about/about-hero";
import { AiProjectNote } from "@/components/about/ai-project-note";
import { DesignPrinciples } from "@/components/about/design-principles";
import { DocumentProblems } from "@/components/about/document-problems";
import { MissionVision } from "@/components/about/mission-vision";
import { PaperlaneIdea } from "@/components/about/paperlane-idea";
import { ProductJourney } from "@/components/about/product-journey";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { usePageMetadata } from "@/lib/use-page-metadata";

export function AboutPage() {
  usePageMetadata({
    title: "About Paperlane | A Better Document Experience",
    description: "Learn about Paperlane, a document productivity concept designed around simplicity, transparency, accessibility and responsible AI.",
  });

  return (
    <>
      <PageBreadcrumb current="About" />
      <AboutHero />
      <DocumentProblems />
      <PaperlaneIdea />
      <MissionVision />
      <DesignPrinciples />
      <ProductJourney />
      <AiProjectNote />
      <AboutCta />
    </>
  );
}
