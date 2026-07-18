import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { getToolById, getToolPageSpec } from "@/data/tool-pages";

export function AddWatermarkPage() {
  return <ToolPageLayout spec={getToolPageSpec("add-watermark")} tool={getToolById("add-watermark")} />;
}
