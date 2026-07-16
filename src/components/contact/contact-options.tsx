import { Card, CardContent } from "@/components/ui/card";
import { contactOptions, type EnquiryType } from "@/data/contact";

type ContactOptionsProps = {
  onSelect: (enquiryType: EnquiryType) => void;
};

export function ContactOptions({ onSelect }: ContactOptionsProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <div className="mb-8 max-w-3xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Contact options</p>
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Choose the kind of message you want to preview.</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {contactOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Card key={option.title} className="transition-colors hover:border-primary/40">
              <CardContent className="p-0">
                <button
                  type="button"
                  onClick={() => onSelect(option.enquiryType)}
                  className="flex h-full w-full flex-col items-start rounded-xl p-5 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <Icon className="mb-4 h-5 w-5 text-primary" aria-hidden="true" />
                  <span className="text-base font-semibold text-foreground">{option.title}</span>
                  <span className="mt-3 text-sm leading-6 text-muted-foreground">{option.description}</span>
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
