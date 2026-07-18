import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { getToolById, getToolPageSpec } from "@/data/tool-pages";

export function RotatePdfPage() {
  return <ToolPageLayout spec={getToolPageSpec("rotate-pdf")} tool={getToolById("rotate-pdf")} />;
}
