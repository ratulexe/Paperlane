import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { getToolById, getToolPageSpec } from "@/data/tool-pages";

export function RemoveBlankPagesPage() {
  return <ToolPageLayout spec={getToolPageSpec("remove-blank-pages")} tool={getToolById("remove-blank-pages")} />;
}
