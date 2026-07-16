import { Card, CardContent } from "@/components/ui/card";
import { missionVision } from "@/data/about";

export function MissionVision() {
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-16">
      {missionVision.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title}>
            <CardContent className="p-6">
              <Icon className="mb-4 h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="text-2xl font-bold tracking-tight text-foreground">{item.title}</h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
