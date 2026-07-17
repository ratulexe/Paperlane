import { ToolCard } from "@/components/tools/tool-card";
import { ToolsEmptyState } from "@/components/tools/tools-empty-state";
import type { DocumentTool } from "@/types/tool";

type ToolsGridProps = {
  tools: DocumentTool[];
  onOpenTool: (tool: DocumentTool) => void;
  onClearSearch: () => void;
  onShowAll: () => void;
};

export function ToolsGrid({ tools, onOpenTool, onClearSearch, onShowAll }: ToolsGridProps) {
  if (!tools.length) {
    return <ToolsEmptyState onClearSearch={onClearSearch} onShowAll={onShowAll} />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} onOpen={onOpenTool} disabled={tool.implementationStatus !== "functional"} />
      ))}
    </div>
  );
}
