import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { getToolById, getToolPageSpec } from "@/data/tool-pages";

export function SplitPdfPage() {
  return <ToolPageLayout spec={getToolPageSpec("split-pdf")} tool={getToolById("split-pdf")} />;
}
