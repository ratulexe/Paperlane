import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { FunctionalToolWorkflow } from "@/components/tools/functional-tool-workflow";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { categoryLabels, tools } from "@/data/tools";
import type { ToolPageSpec } from "@/data/tool-pages";
import { getFunctionalToolRoute, getToolStatusLabel } from "@/lib/tool-routes";
import { usePageMetadata } from "@/lib/use-page-metadata";
import type { DocumentTool } from "@/types/tool";

type ToolPageLayoutProps = {
  spec: ToolPageSpec;
  tool: DocumentTool;
};

export function ToolPageLayout({ spec, tool }: ToolPageLayoutProps) {
  const navigate = useNavigate();
  const Icon = tool.icon;

  usePageMetadata({
    title: spec.title,
    description: spec.description,
  });

  const relatedTools = spec.relatedToolIds
    .map((toolId) => tools.find((item) => item.id === toolId))
    .filter((item): item is DocumentTool => Boolean(item));

  return (
    <>
      <nav aria-label="Breadcrumb" className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link to="/" className="font-medium transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/tools" className="font-medium transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Tools
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-foreground" aria-current="page">
            {tool.name}
          </li>
        </ol>
      </nav>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,1.1fr)] lg:items-start">
          <section className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <Badge>{spec.badge}</Badge>
                <Badge variant="secondary">{categoryLabels[tool.category]}</Badge>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">{spec.h1}</h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">{spec.description}</p>
            </div>

            <Alert>
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <AlertDescription>
                Your file is processed locally in browser memory and is not uploaded to a Paperlane server.
                Browser-local processing reduces server exposure, but it does not guarantee security on shared, public,
                untrusted or compromised devices.
              </AlertDescription>
            </Alert>

            <Card className="shadow-none">
              <CardContent className="space-y-4 p-5">
                <div>
                  <h2 className="text-base font-semibold">Accepted formats</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{spec.acceptedFormats}</p>
                </div>
                <div>
                  <h2 className="text-base font-semibold">File limits</h2>
                  <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">
                    {spec.fileLimits.map((limit) => (
                      <li key={limit} className="flex gap-2">
                        <span aria-hidden="true">-</span>
                        <span>{limit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Button asChild variant="outline">
              <Link to="/tools">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to all tools
              </Link>
            </Button>
          </section>

          <section aria-label={`${tool.name} workflow`} className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
            <FunctionalToolWorkflow tool={tool} onChooseAnother={() => navigate("/tools")} />
          </section>
        </div>

        <section className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,1.1fr)]">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Related tools</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedTools.map((relatedTool) => {
                const route = getFunctionalToolRoute(relatedTool);
                const RelatedIcon = relatedTool.icon;
                return (
                  <Card key={relatedTool.id} className="shadow-none">
                    <CardContent className="flex h-full flex-col gap-3 p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
                          <RelatedIcon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div>
                          <h2 className="text-sm font-semibold">{relatedTool.name}</h2>
                          <p className="text-xs text-muted-foreground">{getToolStatusLabel(relatedTool)}</p>
                        </div>
                      </div>
                      {route ? (
                        <Button asChild variant="outline" className="mt-auto justify-between">
                          <Link to={route}>
                            Open tool
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </Link>
                        </Button>
                      ) : (
                        <>
                          <p className="text-xs font-medium text-muted-foreground">Planned tool — not available yet.</p>
                          <Button
                            variant="outline"
                            className="mt-auto cursor-not-allowed opacity-60"
                            disabled
                            aria-label={`${relatedTool.name} is coming soon`}
                          >
                            Coming soon
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">FAQ</p>
            <Accordion type="single" collapsible className="rounded-xl border bg-card px-4">
              {spec.faq.map((item, index) => (
                <AccordionItem key={item.question} value={`item-${index}`}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>
    </>
  );
}
