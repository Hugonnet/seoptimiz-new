import { ArrowLeft, History, Download } from "lucide-react";
import { Link } from "react-router-dom";

export function StickyHeader() {
  return (
    <div className="sticky top-0 z-50 flex gap-2 p-4 bg-gradient-to-r from-[#6366F1] to-[#EC4899]">
      <Link 
        to="/" 
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-medium hover:bg-opacity-90 transition-all duration-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Accueil
      </Link>
      <Link 
        to="/historique" 
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-medium hover:bg-opacity-90 transition-all duration-300"
      >
        <History className="h-4 w-4" />
        Historique
      </Link>
      <Link 
        to="/exports" 
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-medium hover:bg-opacity-90 transition-all duration-300"
      >
        <Download className="h-4 w-4" />
        Exports
      </Link>
    </div>
  );
}