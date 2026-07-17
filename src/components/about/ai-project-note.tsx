import { Bot } from "lucide-react";
import { ConceptAlert } from "@/components/shared/concept-alert";

export function AiProjectNote() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <div className="rounded-xl border bg-secondary/35 p-6 sm:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <Bot className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Built as an AI-assisted design exploration.</h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              Paperlane was created as an AI-assisted website-generation project exploring how modern productivity products can be planned,
              structured and presented. AI tools supported ideation, interface planning and code generation, followed by manual review,
              testing and refinement.
            </p>
            <ConceptAlert
              className="mt-5 bg-card"
              description="The current website focuses on product design, frontend interaction and selected browser-local processing. It does not include backend document-processing infrastructure."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
