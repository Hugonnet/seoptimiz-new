import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ArrowLeft, BarChart2, History, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function Navigation() {
  return (
    <NavigationMenu className="max-w-full w-full justify-start mb-8 bg-white/80 backdrop-blur-sm shadow-sm rounded-lg p-4">
      <NavigationMenuList className="gap-6">
        <NavigationMenuItem>
          <Link to="/" className={navigationMenuTriggerStyle()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Accueil
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/analyse-approfondie" className={navigationMenuTriggerStyle()}>
            <Search className="mr-2 h-4 w-4" />
            Analyse Approfondie
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/recommandations-ia" className={navigationMenuTriggerStyle()}>
            <Sparkles className="mr-2 h-4 w-4" />
            Recommandations IA
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/historique" className={navigationMenuTriggerStyle()}>
            <History className="mr-2 h-4 w-4" />
            Historique
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/statistiques" className={navigationMenuTriggerStyle()}>
            <BarChart2 className="mr-2 h-4 w-4" />
            Statistiques
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}