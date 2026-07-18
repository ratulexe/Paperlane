import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { getToolById, getToolPageSpec } from "@/data/tool-pages";

export function MergePdfPage() {
  return <ToolPageLayout spec={getToolPageSpec("merge-pdf")} tool={getToolById("merge-pdf")} />;
}
