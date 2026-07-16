import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { transparencyRows } from "@/data/privacy";

export function DataTransparency() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <SectionHeading
        eyebrow="Data transparency"
        title="What a production product would need to explain."
        description="The current Paperlane website is a frontend demonstration. This table separates possible future data needs from the current demo status."
      />
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="w-full" tabIndex={0} aria-label="Data transparency table">
            <div className="min-w-[820px] p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data type</TableHead>
                    <TableHead>Why it could be required</TableHead>
                    <TableHead>Intended design approach</TableHead>
                    <TableHead>Current demo status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transparencyRows.map((row) => (
                    <TableRow key={row.dataType}>
                      <TableCell className="font-semibold whitespace-normal">{row.dataType}</TableCell>
                      <TableCell className="whitespace-normal text-muted-foreground">{row.why}</TableCell>
                      <TableCell className="whitespace-normal text-muted-foreground">{row.approach}</TableCell>
                      <TableCell className="whitespace-normal">
                        <Badge variant="outline" className="whitespace-normal text-left leading-5">
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>
    </section>
  );
}
