import { SectionHeading } from "@/components/shared/section-heading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqItems } from "@/data/homepage";

export function FaqSection() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 md:py-16">
      <SectionHeading
        eyebrow="Frequently asked questions"
        title="Questions about the Paperlane concept."
      />
      <Accordion type="single" collapsible defaultValue="item-0" className="rounded-xl border bg-card px-4">
        {faqItems.map((item, index) => (
          <AccordionItem key={item.question} value={`item-${index}`}>
            <AccordionTrigger className="text-base">{item.question}</AccordionTrigger>
            <AccordionContent className="text-sm leading-6 text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
