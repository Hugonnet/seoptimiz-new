import { Button } from "@/components/ui/button";
import { Download, BarChart2 } from "lucide-react";
import { downloadTableAsCSV } from "@/services/seoService";

interface SEOTableHeaderProps {
  url: string;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
}

export function SEOTableHeader({ url, showAdvanced, onToggleAdvanced }: SEOTableHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-b border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-purple-800">
            Analyse SEO pour :
          </h2>
          <p className="text-gray-700 break-all">{url}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button 
            onClick={onToggleAdvanced} 
            variant="outline" 
            size="sm"
            className="gap-2"
          >
            <BarChart2 className="h-4 w-4" />
            {showAdvanced ? 'Masquer l\'analyse avancée' : 'Analyse avancée'}
          </Button>
          <Button 
            onClick={() => downloadTableAsCSV([{ url }])} 
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>
    </div>
  );
}