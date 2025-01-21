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
      <NavigationMenuList className="gap-6 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg p-4 border border-gray-100">
        <NavigationMenuItem>
          <Link 
            to="/" 
            className={navigationMenuTriggerStyle() + " hover:bg-[#EEF2FF] hover:text-[#6366F1] transition-all duration-300 p-2"}
            title="Accueil"
          >
            <Home className="h-5 w-5" />
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link 
            to="/history" 
            className={navigationMenuTriggerStyle() + " hover:bg-[#EEF2FF] hover:text-[#6366F1] transition-all duration-300 p-2"}
            title="Historique"
          >
            <History className="h-5 w-5" />
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link 
            to="/export" 
            className={navigationMenuTriggerStyle() + " hover:bg-[#EEF2FF] hover:text-[#6366F1] transition-all duration-300 p-2"}
            title="Exports"
          >
            <FileText className="h-5 w-5" />
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link 
            to="/performance" 
            className={navigationMenuTriggerStyle() + " hover:bg-[#EEF2FF] hover:text-[#6366F1] transition-all duration-300 p-2"}
            title="Vitesse"
          >
            <Gauge className="h-5 w-5" />
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}