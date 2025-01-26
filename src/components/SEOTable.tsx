import { Button } from "@/components/ui/button";
import { Download, BarChart2 } from "lucide-react";
import { downloadTableAsCSV } from "@/services/seoService";
import { useSEOStore } from "@/store/seoStore";
import { SEOAnalysisSection } from "./seo/SEOAnalysisSection";
import { AdvancedAnalysisSection } from "./seo/AdvancedAnalysisSection";
import { useState } from "react";

export function SEOTable() {
  const seoData = useSEOStore((state) => state.seoData);
  const [showAdvanced, setShowAdvanced] = useState<{ [key: number]: boolean }>({});

  const toggleAdvanced = (id: number) => {
    setShowAdvanced(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (!seoData || seoData.length === 0) {
    return (
      <div className="text-center py-3 sm:py-4 text-gray-600 bg-white rounded-lg shadow-sm border border-gray-100">
        Aucune donnée SEO disponible. Analysez une URL pour commencer.
      </div>
    );
  }

  const renderSEOSection = (item: any, title: string, type: 'single' | 'array', current: any, suggested: any, context: any) => {
    if (!current) return null;
    
    if (type === 'single' && (!current || current.trim() === '')) return null;
    
    if (type === 'array') {
      if (!Array.isArray(current) || current.length === 0) return null;
      const validItems = current.filter(item => item && typeof item === 'string' && item.trim() !== '');
      if (validItems.length === 0) return null;
      current = validItems;
    }

    return (
      <SEOAnalysisSection
        title={title}
        type={type}
        current={current}
        suggested={suggested || (type === 'array' ? [] : '')}
        context={context || (type === 'array' ? [] : '')}
      />
    );
  };

  return (
    <div className="space-y-6">
      {seoData.map((item) => (
        <div key={item.id} className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-xl font-semibold text-purple-600">
              Analyse SEO pour : <span className="text-gray-700 break-all">{item.url}</span>
            </h2>
            <div className="flex gap-2">
              <Button 
                onClick={() => toggleAdvanced(item.id)} 
                variant="outline" 
                className="gap-2"
              >
                <BarChart2 className="h-4 w-4" />
                {showAdvanced[item.id] ? 'Masquer l\'analyse avancée' : 'Analyse avancée'}
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
          
          <div className="space-y-6">
            {renderSEOSection(item, "Meta Title", "single", item.current_title, item.suggested_title, item.title_context)}
            {renderSEOSection(item, "Meta Description", "single", item.current_description, item.suggested_description, item.description_context)}
            {renderSEOSection(item, "H1", "single", item.current_h1, item.suggested_h1, item.h1_context)}
            {renderSEOSection(item, "H2", "array", item.current_h2s, item.suggested_h2s, item.h2s_context)}
            {renderSEOSection(item, "H3", "array", item.current_h3s, item.suggested_h3s, item.h3s_context)}
            {renderSEOSection(item, "H4", "array", item.current_h4s, item.suggested_h4s, item.h4s_context)}

            {showAdvanced[item.id] && (
              <AdvancedAnalysisSection
                readabilityScore={item.readability_score}
                contentLength={item.content_length}
                internalLinks={item.internal_links}
                externalLinks={item.external_links}
                brokenLinks={item.broken_links}
                imageAlts={item.image_alts}
                pageLoadSpeed={item.page_load_speed}
                mobileFriendly={item.mobile_friendly}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}