import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { filterOptions } from "@/data/tools";
import type { ToolCategory } from "@/types/tool";

type ToolFilterBarProps = {
  selectedCategory: ToolCategory | "all";
  searchQuery: string;
  resultCount: number;
  onCategoryChange: (category: ToolCategory | "all") => void;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
};

export function ToolFilterBar({
  selectedCategory,
  searchQuery,
  resultCount,
  onCategoryChange,
  onSearchChange,
  onClearSearch,
}: ToolFilterBarProps) {
  return (
    <div className="space-y-4">
      <div className="relative max-w-lg">
        <label htmlFor="tool-search" className="sr-only">
          Search document tools
        </label>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          id="tool-search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape" && searchQuery) onClearSearch();
          }}
          placeholder="Search document tools"
          className="pr-10 pl-9"
        />
        {searchQuery ? (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            onClick={onClearSearch}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        ) : null}
      </div>

      <div className="overflow-x-auto pb-1" aria-label="Tool category filter">
        <ToggleGroup
          type="single"
          value={selectedCategory}
          onValueChange={(value) => {
            if (value) onCategoryChange(value as ToolCategory | "all");
          }}
          variant="outline"
          className="min-w-max"
          aria-label="Filter document tools by category"
        >
          {filterOptions.map((option) => (
            <ToggleGroupItem key={option.value} value={option.value} aria-label={`Show ${option.label}`}>
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <p className="text-sm font-medium text-muted-foreground" aria-live="polite">
        Showing {resultCount} {resultCount === 1 ? "tool" : "tools"}
      </p>
    </div>
  );
}
