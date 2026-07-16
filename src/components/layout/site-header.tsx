import { FileText, Menu } from "lucide-react";
import { NavLink } from "react-router-dom";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Tools", to: "/tools" },
  { label: "Privacy", to: "/privacy" },
  { label: "Contact", to: "/contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/88">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2" aria-label="Paperlane home">
          <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
          <span className="paperlane-wordmark text-4xl leading-none text-foreground">Paperlane</span>
        </NavLink>

        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            {navItems.map((item) => (
              <NavigationMenuItem key={item.to}>
                <NavigationMenuLink asChild>
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive && "bg-secondary text-foreground",
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="hidden lg:block">
          <Button asChild>
            <NavLink to="/tools">Open Workspace</NavLink>
          </Button>
        </div>

        <MobileNavigation items={navItems}>
          <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open navigation menu">
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
        </MobileNavigation>
      </div>
    </header>
  );
}
