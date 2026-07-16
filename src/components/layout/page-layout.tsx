import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

type PageLayoutProps = {
  children: ReactNode;
};

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <TooltipProvider>
      <div className="flex min-h-screen flex-col">
        <a
          href="#main-content"
          className="sr-only z-50 rounded-md bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline-none focus:ring-[3px] focus:ring-ring/50"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content" className="flex-1" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
        <Toaster richColors position="bottom-right" />
      </div>
    </TooltipProvider>
  );
}
