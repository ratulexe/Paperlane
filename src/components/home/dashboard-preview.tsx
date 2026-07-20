import { MoreHorizontal } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dashboardRows, sidebarItems } from "@/data/tools";
import { cn } from "@/lib/utils";

function statusVariant(status: string): "default" | "secondary" | "outline" {
  if (status === "Local") return "default";
  if (status === "Cloud") return "outline";
  if (status === "Concept") return "secondary";
  return "outline";
}

export function DashboardPreview() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <SectionHeading
        title="A consistent workspace for every workflow."
        description="A later product view showing categories, recent actions, local-processing state, temporary cloud status and concept status."
      />
      <Card className="overflow-hidden shadow-sm">
        <CardContent className="grid gap-0 p-0 lg:grid-cols-[180px_minmax(0,1fr)_220px]">
          <aside className="border-b bg-muted/35 p-4 lg:border-b-0 lg:border-r">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Workspace
            </p>
            <nav className="grid gap-1" aria-label="Dashboard concept navigation">
              {sidebarItems.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={cn(
                    "rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    item === "Overview" && "bg-background text-foreground shadow-xs",
                  )}
                >
                  {item}
                </button>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Document workflows</h3>
                <p className="text-sm text-muted-foreground">Example workspace data. No files are stored.</p>
              </div>
              <Badge variant="secondary">Product interface concept</Badge>
            </div>
            <div className="overflow-x-auto rounded-lg border" tabIndex={0} aria-label="Scrollable document workflow table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Workflow</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardRows.map((row) => {
                    const Icon = row.icon;
                    return (
                      <TableRow key={row.document}>
                        <TableCell className="min-w-44 font-medium">
                          <span className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                            {row.document}
                          </span>
                        </TableCell>
                        <TableCell>{row.workflow}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{row.updated}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label={`Actions for ${row.document}`}>
                                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View concept details</DropdownMenuItem>
                              <DropdownMenuItem>Preview workflow</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <aside className="border-t bg-muted/25 p-4 lg:border-l lg:border-t-0">
            <Card className="shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Workspace usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">Local merge workflow</span>
                  <span className="text-muted-foreground">68%</span>
                </div>
                <Progress value={68} />
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  Workflow progress is example workspace data, not a stored account history.
                </p>
              </CardContent>
            </Card>
            <Separator className="my-4" />
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Queue concept</p>
              <Skeleton className="h-3 w-11/12" />
              <Skeleton className="h-3 w-8/12" />
              <Skeleton className="h-3 w-10/12" />
            </div>
          </aside>
        </CardContent>
      </Card>
    </section>
  );
}
