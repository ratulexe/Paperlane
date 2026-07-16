import { SectionHeading } from "@/components/shared/section-heading";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { conceptStories } from "@/data/homepage";

export function UserStoriesSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <SectionHeading
        eyebrow="Concept user stories"
        title="Designed for everyday document work."
        description="These are concept scenarios, not verified testimonials."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {conceptStories.map((story) => (
          <Card key={story.role} className="shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{story.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">{story.role}</h3>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Concept scenario
                  </p>
                </div>
              </div>
              <blockquote className="mt-5 text-sm leading-6 text-muted-foreground">
                "{story.quote}"
              </blockquote>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
