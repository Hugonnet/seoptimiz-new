import { Home, History, Download } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function StickyHeader() {
  return (
    <div className="sticky top-0 z-50 flex gap-2 p-2 sm:p-4 bg-gradient-to-r from-[#6366F1] to-[#EC4899]">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link 
              to="/" 
              className="p-2 hover:bg-white/10 rounded-full transition-colors duration-300"
            >
              <Home className="h-5 w-5 text-white" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Accueil</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Link 
              to="/historique" 
              className="p-2 hover:bg-white/10 rounded-full transition-colors duration-300"
            >
              <History className="h-5 w-5 text-white" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Historique</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Link 
              to="/exports" 
              className="p-2 hover:bg-white/10 rounded-full transition-colors duration-300"
            >
              <Download className="h-5 w-5 text-white" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Exports</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}