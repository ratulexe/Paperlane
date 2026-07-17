import { useMemo, useRef, useState } from "react";
import { ToolCategoryOverview } from "@/components/tools/tool-category-overview";
import { ToolFilterBar } from "@/components/tools/tool-filter-bar";
import { ToolWorkflowDialog } from "@/components/tools/tool-workflow-dialog";
import { ToolsCta } from "@/components/tools/tools-cta";
import { ToolsDemoExplanation } from "@/components/tools/tools-demo-explanation";
import { ToolsGrid } from "@/components/tools/tools-grid";
import { ToolsHero } from "@/components/tools/tools-hero";
import { tools, categoryLabels } from "@/data/tools";
import { usePageMetadata } from "@/lib/use-page-metadata";
import type { DocumentTool, ToolCategory } from "@/types/tool";

export function ToolsPage() {
  const catalogueRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTool, setSelectedTool] = useState<DocumentTool | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const scrollTo = (element: HTMLElement | null) => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  };

  usePageMetadata({
    title: "Document Tools | Paperlane",
    description:
      "Explore Paperlane's browser-local PDF tools and concept previews for document organisation, conversion, optimisation, AI and security workflows.",
  });

  const filteredTools = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    return tools.filter((tool) => {
      const categoryMatch = selectedCategory === "all" || tool.category === selectedCategory;
      const searchMatch =
        !normalizedSearch ||
        tool.name.toLowerCase().includes(normalizedSearch) ||
        tool.shortDescription.toLowerCase().includes(normalizedSearch) ||
        categoryLabels[tool.category].toLowerCase().includes(normalizedSearch);
      return categoryMatch && searchMatch;
    });
  }, [searchQuery, selectedCategory]);

  const showAllTools = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    scrollTo(catalogueRef.current);
  };

  const setFilterCategory = (category: ToolCategory | "all") => {
    setSelectedCategory(category);
  };

  const selectOverviewCategory = (category: ToolCategory) => {
    setSelectedCategory(category);
    setSearchQuery("");
    scrollTo(catalogueRef.current);
  };

  const openTool = (tool: DocumentTool) => {
    setSelectedTool(tool);
    setDialogOpen(true);
  };

  return (
    <>
      <ToolsHero
        onBrowseTools={() => scrollTo(catalogueRef.current)}
        onShowDemo={() => scrollTo(demoRef.current)}
      />

      <section ref={catalogueRef} className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Tool catalogue</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Choose a document workflow.</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            Filter, search and open each tool to process locally where supported or preview the intended interface.
          </p>
        </div>
        <ToolFilterBar
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          resultCount={filteredTools.length}
          onCategoryChange={setFilterCategory}
          onSearchChange={setSearchQuery}
          onClearSearch={() => setSearchQuery("")}
        />
        <div className="mt-6">
          <ToolsGrid
            tools={filteredTools}
            onOpenTool={openTool}
            onClearSearch={() => setSearchQuery("")}
            onShowAll={showAllTools}
          />
        </div>
      </section>

      <section ref={demoRef}>
        <ToolsDemoExplanation />
      </section>
      <ToolCategoryOverview onSelectCategory={selectOverviewCategory} />
      <ToolsCta />

      <ToolWorkflowDialog
        key={`${selectedTool?.id ?? "empty"}-${dialogOpen ? "open" : "closed"}`}
        tool={selectedTool}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
