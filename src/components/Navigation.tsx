import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ArrowLeft, History, Download, Gauge } from "lucide-react";
import { Link } from "react-router-dom";

export function Navigation() {
  return (
    <NavigationMenu className="max-w-full w-full justify-start">
      <NavigationMenuList className="gap-2 md:gap-4 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg p-2 md:p-4 border border-gray-100">
        <NavigationMenuItem>
          <Link 
            to="/" 
            className={navigationMenuTriggerStyle() + " hover:bg-[#EEF2FF] hover:text-[#6366F1] transition-all duration-300"}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Accueil
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link 
            to="/history" 
            className={navigationMenuTriggerStyle() + " hover:bg-[#EEF2FF] hover:text-[#6366F1] transition-all duration-300"}
          >
            <History className="mr-2 h-4 w-4" />
            Historique
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link 
            to="/export" 
            className={navigationMenuTriggerStyle() + " hover:bg-[#EEF2FF] hover:text-[#6366F1] transition-all duration-300"}
          >
            <Download className="mr-2 h-4 w-4" />
            Exports
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link 
            to="/performance" 
            className={navigationMenuTriggerStyle() + " hover:bg-[#EEF2FF] hover:text-[#6366F1] transition-all duration-300"}
          >
            <Gauge className="mr-2 h-4 w-4" />
            Vitesse
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}