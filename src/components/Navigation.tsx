import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ArrowLeft, History, Download } from "lucide-react";
import { Link } from "react-router-dom";

export function Navigation() {
  return (
    <NavigationMenu className="max-w-full w-full justify-start">
      <NavigationMenuList className="gap-2 md:gap-4 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg p-2 md:p-4 border border-gray-100 flex flex-wrap md:flex-nowrap">
        <NavigationMenuItem>
          <Link 
            to="/" 
            className={navigationMenuTriggerStyle() + " hover:bg-[#EEF2FF] hover:text-[#6366F1] transition-all duration-300 text-xs md:text-sm whitespace-nowrap"}
          >
            <ArrowLeft className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
            Accueil
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link 
            to="/history" 
            className={navigationMenuTriggerStyle() + " hover:bg-[#EEF2FF] hover:text-[#6366F1] transition-all duration-300 text-xs md:text-sm whitespace-nowrap"}
          >
            <History className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
            Historique
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link 
            to="/export" 
            className={navigationMenuTriggerStyle() + " hover:bg-[#EEF2FF] hover:text-[#6366F1] transition-all duration-300 text-xs md:text-sm whitespace-nowrap"}
          >
            <Download className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
            Exports
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}