import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Home, History, FileText, Gauge } from "lucide-react";
import { Link } from "react-router-dom";

export function Navigation() {
  return (
    <NavigationMenu className="max-w-full w-full justify-center">
      <NavigationMenuList className="gap-8 bg-white/10 backdrop-blur-sm rounded-lg p-4">
        <NavigationMenuItem>
          <Link 
            to="/" 
            className={navigationMenuTriggerStyle() + " hover:bg-white/20 transition-all duration-300 p-2"}
            title="Accueil"
          >
            <Home className="h-7 w-7 text-white" strokeWidth={1.5} />
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link 
            to="/history" 
            className={navigationMenuTriggerStyle() + " hover:bg-white/20 transition-all duration-300 p-2"}
            title="Historique"
          >
            <History className="h-7 w-7 text-white" strokeWidth={1.5} />
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link 
            to="/export" 
            className={navigationMenuTriggerStyle() + " hover:bg-white/20 transition-all duration-300 p-2"}
            title="Exports"
          >
            <FileText className="h-7 w-7 text-white" strokeWidth={1.5} />
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link 
            to="/performance" 
            className={navigationMenuTriggerStyle() + " hover:bg-white/20 transition-all duration-300 p-2"}
            title="Vitesse"
          >
            <Gauge className="h-7 w-7 text-white" strokeWidth={1.5} />
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}