import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { getToolById, getToolPageSpec } from "@/data/tool-pages";

export function VisualSignPdfPage() {
  return <ToolPageLayout spec={getToolPageSpec("sign-document")} tool={getToolById("sign-document")} />;
}
