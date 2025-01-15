import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadTableAsCSV } from "@/services/seoService";
import { useSEOStore } from "@/store/seoStore";
import { SEOAnalysisSection } from "./seo/SEOAnalysisSection";

export function SEOTable() {
  const seoData = useSEOStore((state) => state.seoData);

  if (seoData.length === 0) {
    return (
      <div className="text-center py-3 sm:py-4 text-gray-600 bg-white rounded-lg shadow-sm border border-gray-100">
        Aucune donnée SEO disponible. Analysez une URL pour commencer.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {seoData.map((item) => (
        <div key={item.id} className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-purple-600">
              Analyse SEO pour : <span className="text-gray-700 break-all">{item.url}</span>
            </h2>
            <Button 
              onClick={() => downloadTableAsCSV(seoData)} 
              variant="outline" 
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>
          
          <div className="space-y-6">
            <SEOAnalysisSection
              title="Meta Title"
              type="single"
              current={item.current_title || ''}
              suggested={item.suggested_title || ''}
              context={item.title_context}
            />
            <SEOAnalysisSection
              title="Meta Description"
              type="single"
              current={item.current_description || ''}
              suggested={item.suggested_description || ''}
              context={item.description_context}
            />
            <SEOAnalysisSection
              title="H1"
              type="single"
              current={item.current_h1 || ''}
              suggested={item.suggested_h1 || ''}
              context={item.h1_context}
            />
            <SEOAnalysisSection
              title="H2"
              type="array"
              current={item.current_h2s || []}
              suggested={item.suggested_h2s || []}
              context={item.h2s_context}
            />
            <SEOAnalysisSection
              title="H3"
              type="array"
              current={item.current_h3s || []}
              suggested={item.suggested_h3s || []}
              context={item.h3s_context}
            />
            <SEOAnalysisSection
              title="H4"
              type="array"
              current={item.current_h4s || []}
              suggested={item.suggested_h4s || []}
              context={item.h4s_context}
            />
          </div>
        </div>
      ))}
    </div>
  );
}