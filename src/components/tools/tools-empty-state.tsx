import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type ToolsEmptyStateProps = {
  onClearSearch: () => void;
  onShowAll: () => void;
};

export function ToolsEmptyState({ onClearSearch, onShowAll }: ToolsEmptyStateProps) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX className="h-5 w-5" aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>No matching tools</EmptyTitle>
        <EmptyDescription>Try a different search term or choose another category.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="outline" onClick={onClearSearch}>
            Clear Search
          </Button>
          <Button onClick={onShowAll}>Show All Tools</Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
