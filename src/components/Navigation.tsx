import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ArrowLeft, Search, History, Download } from "lucide-react";
import { Link } from "react-router-dom";

export function Navigation() {
  return (
    <NavigationMenu className="max-w-full w-full justify-start mb-8">
      <NavigationMenuList className="gap-4 bg-white/80 backdrop-blur-sm shadow-sm rounded-lg p-4 border border-gray-100">
        <NavigationMenuItem>
          <Link 
            to="/" 
            className={navigationMenuTriggerStyle() + " hover:bg-[#EEF2FF] hover:text-[#6366F1] transition-colors"}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Accueil
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link 
            to="/analyse" 
            className={navigationMenuTriggerStyle() + " hover:bg-[#EEF2FF] hover:text-[#6366F1] transition-colors"}
          >
            <Search className="mr-2 h-4 w-4" />
            Analyse SEO
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link 
            to="/historique" 
            className={navigationMenuTriggerStyle() + " hover:bg-[#EEF2FF] hover:text-[#6366F1] transition-colors"}
          >
            <History className="mr-2 h-4 w-4" />
            Historique
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link 
            to="/exports" 
            className={navigationMenuTriggerStyle() + " hover:bg-[#EEF2FF] hover:text-[#6366F1] transition-colors"}
          >
            <Download className="mr-2 h-4 w-4" />
            Exports
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}