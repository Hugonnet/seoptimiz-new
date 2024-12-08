import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function Navigation() {
  return (
    <NavigationMenu className="max-w-full w-full justify-start mb-8">
      <NavigationMenuList className="gap-6">
        <NavigationMenuItem>
          <Link to="/" className={navigationMenuTriggerStyle()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/analyse" className={navigationMenuTriggerStyle()}>
            Analyse SEO
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/historique" className={navigationMenuTriggerStyle()}>
            Historique
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}