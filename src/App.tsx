import { Route, Routes } from "react-router-dom";
import { PageLayout } from "@/components/layout/page-layout";
import { AboutPage } from "@/pages/about-page";
import { ContactPage } from "@/pages/contact-page";
import { HomePage } from "@/pages/home-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { PrivacyPage } from "@/pages/privacy-page";
import { ToolsPage } from "@/pages/tools-page";

export default function App() {
  return (
    <PageLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </PageLayout>
  );
}
