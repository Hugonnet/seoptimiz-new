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

  return (
    <div className="space-y-6">
      {seoData.map((item) => {
        console.log('Processing SEO item:', JSON.stringify(item, null, 2));
        
        return (
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
              {item.current_title && (
                <SEOAnalysisSection
                  title="Meta Title"
                  type="single"
                  current={item.current_title}
                  suggested={item.suggested_title || ''}
                  context={item.title_context || ''}
                />
              )}
              
              {item.current_description && (
                <SEOAnalysisSection
                  title="Meta Description"
                  type="single"
                  current={item.current_description}
                  suggested={item.suggested_description || ''}
                  context={item.description_context || ''}
                />
              )}
              
              {item.current_h1 && item.current_h1.trim() !== '' && (
                <SEOAnalysisSection
                  title="H1"
                  type="single"
                  current={item.current_h1}
                  suggested={item.suggested_h1 || ''}
                  context={item.h1_context || ''}
                />
              )}
              
              {Array.isArray(item.current_h2s) && item.current_h2s.length > 0 && item.current_h2s.some(h2 => h2 && h2.trim() !== '') && (
                <SEOAnalysisSection
                  title="H2"
                  type="array"
                  current={item.current_h2s.filter(h2 => h2 && h2.trim() !== '')}
                  suggested={item.suggested_h2s || []}
                  context={item.h2s_context || []}
                />
              )}
              
              {Array.isArray(item.current_h3s) && item.current_h3s.length > 0 && item.current_h3s.some(h3 => h3 && h3.trim() !== '') && (
                <SEOAnalysisSection
                  title="H3"
                  type="array"
                  current={item.current_h3s.filter(h3 => h3 && h3.trim() !== '')}
                  suggested={item.suggested_h3s || []}
                  context={item.h3s_context || []}
                />
              )}
              
              {Array.isArray(item.current_h4s) && item.current_h4s.length > 0 && item.current_h4s.some(h4 => h4 && h4.trim() !== '') && (
                <SEOAnalysisSection
                  title="H4"
                  type="array"
                  current={item.current_h4s.filter(h4 => h4 && h4.trim() !== '')}
                  suggested={item.suggested_h4s || []}
                  context={item.h4s_context || []}
                />
              )}

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
        );
      })}
    </div>
  );
}