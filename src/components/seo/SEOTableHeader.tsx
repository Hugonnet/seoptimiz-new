import { Button } from "@/components/ui/button";
import { Download, BarChart2 } from "lucide-react";
import { downloadTableAsCSV } from "@/services/seoService";
import { SEOAnalysis } from "@/store/seoStore";

interface SEOTableHeaderProps {
  url: string;
  seoData: SEOAnalysis[];
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
}

export function SEOTableHeader({ url, seoData, showAdvanced, onToggleAdvanced }: SEOTableHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold text-purple-600">
        Analyse SEO pour : <span className="text-gray-700 break-all">{url}</span>
      </h2>
      <div className="flex gap-2">
        <Button 
          onClick={onToggleAdvanced} 
          variant="outline" 
          className="gap-2"
        >
          <BarChart2 className="h-4 w-4" />
          {showAdvanced ? 'Masquer l\'analyse avancée' : 'Analyse avancée'}
        </Button>
        <Button 
          onClick={() => downloadTableAsCSV(seoData)} 
          variant="outline" 
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Exporter
        </Button>
      </div>
    </div>
  );
}