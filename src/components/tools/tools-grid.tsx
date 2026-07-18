import { ToolCard } from "@/components/tools/tool-card";
import { ToolsEmptyState } from "@/components/tools/tools-empty-state";
import { getFunctionalToolRoute } from "@/lib/tool-routes";
import type { DocumentTool } from "@/types/tool";

type ToolsGridProps = {
  tools: DocumentTool[];
  onClearSearch: () => void;
  onShowAll: () => void;
};

export function ToolsGrid({ tools, onClearSearch, onShowAll }: ToolsGridProps) {
  if (!tools.length) {
    return <ToolsEmptyState onClearSearch={onClearSearch} onShowAll={onShowAll} />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard
          key={tool.id}
          tool={tool}
          to={getFunctionalToolRoute(tool)}
        />
      ))}
    </div>
  );
}
