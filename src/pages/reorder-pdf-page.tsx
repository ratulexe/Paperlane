import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { getToolById, getToolPageSpec } from "@/data/tool-pages";

export function ReorderPdfPage() {
  return <ToolPageLayout spec={getToolPageSpec("reorder-pages")} tool={getToolById("reorder-pages")} />;
}
