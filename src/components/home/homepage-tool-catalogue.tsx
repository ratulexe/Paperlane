import { useMemo, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { ToolCard } from "@/components/tools/tool-card";
import { ToolsEmptyState } from "@/components/tools/tools-empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { categoryLabels, tools } from "@/data/tools";
import { getFunctionalToolRoute } from "@/lib/tool-routes";
import type { ToolCategory } from "@/types/tool";

type HomepageFilter = ToolCategory | "all" | "available";

const homepageFilterOptions: Array<{ value: HomepageFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "available", label: "Available Tools" },
  { value: "organise", label: "Organise" },
  { value: "convert", label: "Convert" },
  { value: "optimise", label: "Optimise" },
  { value: "ai", label: "AI Tools" },
  { value: "security", label: "Security" },
];

export function HomepageToolCatalogue() {
  const [selectedFilter, setSelectedFilter] = useState<HomepageFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return tools.filter((tool) => {
      const filterMatch =
        selectedFilter === "all" ||
        (selectedFilter === "available" && tool.implementationStatus !== "coming-soon") ||
        tool.category === selectedFilter;
      const searchMatch =
        !normalizedSearch ||
        tool.name.toLowerCase().includes(normalizedSearch) ||
        tool.shortDescription.toLowerCase().includes(normalizedSearch) ||
        categoryLabels[tool.category].toLowerCase().includes(normalizedSearch);

      return filterMatch && searchMatch;
    });
  }, [searchQuery, selectedFilter]);

  const clearSearch = () => setSearchQuery("");

  const showAllTools = () => {
    setSelectedFilter("all");
    setSearchQuery("");
  };

  return (
    <section id="homepage-tools" className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-4 sm:px-6 md:py-6">
      <div className="mb-4 max-w-3xl">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Document toolkit</p>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Choose what you need to do.</h2>
        <p className="mt-2 text-base leading-7 text-muted-foreground">
          Start a browser-local document action or explore one of Paperlane's additional workflow concepts.
        </p>
      </div>

      <div className="mb-4 rounded-xl border bg-card/70 p-3 shadow-xs">
        <div className="grid gap-4 lg:grid-cols-[minmax(260px,420px)_minmax(0,1fr)] lg:items-start">
          <div className="relative">
            <label htmlFor="homepage-tool-search" className="sr-only">
              Search document tools
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id="homepage-tool-search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape" && searchQuery) clearSearch();
              }}
              placeholder="Search document tools"
              className="pr-10 pl-9"
            />
            {searchQuery ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            ) : null}
          </div>

          <div className="min-w-0 space-y-3">
            <div className="overflow-x-auto pb-1" aria-label="Homepage tool category filter">
              <ToggleGroup
                type="single"
                value={selectedFilter}
                onValueChange={(value) => {
                  if (value) setSelectedFilter(value as HomepageFilter);
                }}
                variant="outline"
                className="min-w-max justify-start"
                aria-label="Filter homepage document tools"
              >
                {homepageFilterOptions.map((option) => (
                  <ToggleGroupItem key={option.value} value={option.value} aria-label={`Show ${option.label}`}>
                    {option.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <p className="text-sm font-medium text-muted-foreground" aria-live="polite">
              Showing {filteredTools.length} {filteredTools.length === 1 ? "tool" : "tools"}
            </p>
          </div>
        </div>
      </div>

      {filteredTools.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              to={getFunctionalToolRoute(tool)}
            />
          ))}
        </div>
      ) : (
        <ToolsEmptyState onClearSearch={clearSearch} onShowAll={showAllTools} />
      )}

      <div className="mt-7">
        <Button asChild variant="link" className="px-0">
          <Link to="/tools">
            View the full Tools page
            <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
