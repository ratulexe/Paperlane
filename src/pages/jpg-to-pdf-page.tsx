import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { getToolById, getToolPageSpec } from "@/data/tool-pages";

export function JpgToPdfPage() {
  return <ToolPageLayout spec={getToolPageSpec("jpg-to-pdf")} tool={getToolById("jpg-to-pdf")} />;
}
