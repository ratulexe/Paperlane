import { useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NavigationItem = {
  label: string;
  to: string;
};

type MobileNavigationProps = {
  children: ReactNode;
  items: NavigationItem[];
};

export function MobileNavigation({ children, items }: MobileNavigationProps) {
  const [openPath, setOpenPath] = useState<string | null>(null);
  const location = useLocation();
  const open = openPath === location.pathname;

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => setOpenPath(nextOpen ? location.pathname : null)}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-80" onEscapeKeyDown={() => setOpenPath(null)}>
        <SheetHeader>
          <SheetTitle>
            <span className="paperlane-wordmark text-4xl leading-none">Paperlane</span>
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-8 grid gap-2" aria-label="Mobile navigation">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setOpenPath(null)}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-base font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive && "bg-secondary text-foreground",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Button asChild className="mt-4 justify-center">
            <NavLink to="/tools" onClick={() => setOpenPath(null)}>
              Open Workspace
            </NavLink>
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
