import { ShieldAlert } from "lucide-react";
import { ConceptAlert } from "@/components/shared/concept-alert";

export function ConceptNotice() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
      <ConceptAlert
        icon={ShieldAlert}
        title="Frontend concept notice"
        description="Paperlane includes selected browser-local document tools and additional concept previews. Functional tools do not upload files to a Paperlane server, and concept previews do not process or create output files."
      />
    </section>
  );
}
