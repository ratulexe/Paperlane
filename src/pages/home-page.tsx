import { BenefitsSection } from "@/components/home/benefits-section";
import { DashboardPreview } from "@/components/home/dashboard-preview";
import { FaqSection } from "@/components/home/faq-section";
import { FinalCtaSection } from "@/components/home/final-cta-section";
import { HeroSection } from "@/components/home/hero-section";
import { HomepageToolCatalogue } from "@/components/home/homepage-tool-catalogue";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { LocalProcessingSection } from "@/components/home/local-processing-section";
import { PrivacySection } from "@/components/home/privacy-section";
import { UserStoriesSection } from "@/components/home/user-stories-section";
import { usePageMetadata } from "@/lib/use-page-metadata";

export function HomePage() {
  usePageMetadata({
    title: "Paperlane | A Smoother Way to Work With Documents",
    description:
      "Explore Paperlane, a privacy-conscious document productivity concept with selected browser-local PDF tools and clear workflow previews.",
  });

  return (
    <>
      <HeroSection />
      <HomepageToolCatalogue />
      <LocalProcessingSection />
      <HowItWorksSection />
      <PrivacySection />
      <DashboardPreview />
      <BenefitsSection />
      <UserStoriesSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  );
}
