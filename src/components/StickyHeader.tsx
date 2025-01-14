import { Home, History, FileSpreadsheet } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function StickyHeader() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { path: "/", icon: Home, tooltip: "Accueil" },
    { path: "/historique", icon: History, tooltip: "Historique" },
    { path: "/export", icon: FileSpreadsheet, tooltip: "Export" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-[#6366F1] to-[#EC4899] shadow-lg">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-center space-x-6 md:space-x-8">
          <TooltipProvider>
            {navigationItems.map(({ path, icon: Icon, tooltip }) => (
              <Tooltip key={path}>
                <TooltipTrigger asChild>
                  <Link
                    to={path}
                    className={`transition-colors duration-200 ${
                      isActive(path)
                        ? "text-white"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}