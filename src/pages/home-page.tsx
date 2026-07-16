import { BenefitsSection } from "@/components/home/benefits-section";
import { DashboardPreview } from "@/components/home/dashboard-preview";
import { FaqSection } from "@/components/home/faq-section";
import { FinalCtaSection } from "@/components/home/final-cta-section";
import { HeroSection } from "@/components/home/hero-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { PopularToolsSection } from "@/components/home/popular-tools-section";
import { PrivacySection } from "@/components/home/privacy-section";
import { UserStoriesSection } from "@/components/home/user-stories-section";
import { usePageMetadata } from "@/lib/use-page-metadata";

export function HomePage() {
  usePageMetadata({
    title: "Paperlane | A Smoother Way to Work With Documents",
    description: "Explore Paperlane, a privacy-conscious document productivity concept featuring clear tools for organising, converting and understanding documents.",
  });

  return (
    <>
      <HeroSection />
      <PopularToolsSection />
      <HowItWorksSection />
      <PrivacySection />
      <BenefitsSection />
      <DashboardPreview />
      <UserStoriesSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  );
}
