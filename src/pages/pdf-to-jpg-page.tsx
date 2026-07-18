import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { getToolById, getToolPageSpec } from "@/data/tool-pages";

export function PdfToJpgPage() {
  return <ToolPageLayout spec={getToolPageSpec("pdf-to-jpg")} tool={getToolById("pdf-to-jpg")} />;
}
