import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { PageLayout } from "@/components/layout/page-layout";
import { RouteLoadingFallback } from "@/components/shared/route-loading-fallback";
import { ScrollToTop } from "@/components/shared/scroll-to-top";
import { HomePage } from "@/pages/home-page";

const AboutPage = lazy(() => import("@/pages/about-page").then((module) => ({ default: module.AboutPage })));
const ToolsPage = lazy(() => import("@/pages/tools-page").then((module) => ({ default: module.ToolsPage })));
const MergePdfPage = lazy(() => import("@/pages/merge-pdf-page").then((module) => ({ default: module.MergePdfPage })));
const SplitPdfPage = lazy(() => import("@/pages/split-pdf-page").then((module) => ({ default: module.SplitPdfPage })));
const RotatePdfPage = lazy(() => import("@/pages/rotate-pdf-page").then((module) => ({ default: module.RotatePdfPage })));
const ReorderPdfPage = lazy(() => import("@/pages/reorder-pdf-page").then((module) => ({ default: module.ReorderPdfPage })));
const JpgToPdfPage = lazy(() => import("@/pages/jpg-to-pdf-page").then((module) => ({ default: module.JpgToPdfPage })));
const AddWatermarkPage = lazy(() => import("@/pages/add-watermark-page").then((module) => ({ default: module.AddWatermarkPage })));
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
          <Route path="/merge-pdf" element={<MergePdfPage />} />
          <Route path="/split-pdf" element={<SplitPdfPage />} />
          <Route path="/rotate-pdf" element={<RotatePdfPage />} />
          <Route path="/reorder-pdf" element={<ReorderPdfPage />} />
          <Route path="/jpg-to-pdf" element={<JpgToPdfPage />} />
          <Route path="/add-watermark" element={<AddWatermarkPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </PageLayout>
  );
}
