import { ShieldAlert } from "lucide-react";
import { ConceptAlert } from "@/components/shared/concept-alert";

export function ConceptNotice() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
      <ConceptAlert
        icon={ShieldAlert}
        title="Frontend concept notice"
        description="Paperlane is currently a frontend demonstration. It does not upload, store, convert, analyse or transmit selected documents."
      />
    </section>
  );
}
