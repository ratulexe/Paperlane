import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { PageLayout } from "@/components/layout/page-layout";
import { RouteLoadingFallback } from "@/components/shared/route-loading-fallback";
import { ScrollToTop } from "@/components/shared/scroll-to-top";
import { HomePage } from "@/pages/home-page";

const AboutPage = lazy(() => import("@/pages/about-page").then((module) => ({ default: module.AboutPage })));
const ToolsPage = lazy(() => import("@/pages/tools-page").then((module) => ({ default: module.ToolsPage })));
const PrivacyPage = lazy(() => import("@/pages/privacy-page").then((module) => ({ default: module.PrivacyPage })));
const ContactPage = lazy(() => import("@/pages/contact-page").then((module) => ({ default: module.ContactPage })));
const NotFoundPage = lazy(() => import("@/pages/not-found-page").then((module) => ({ default: module.NotFoundPage })));

export default function App() {
  return (
    <PageLayout>
      <ScrollToTop />
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </PageLayout>
  );
}
