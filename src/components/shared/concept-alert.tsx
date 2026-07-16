import type { LucideIcon } from "lucide-react";
import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ConceptAlertProps = {
  title?: string;
  description: string;
  icon?: LucideIcon;
  className?: string;
};

export function ConceptAlert({ title, description, icon: Icon = Info, className }: ConceptAlertProps) {
  return (
    <Alert className={className}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
