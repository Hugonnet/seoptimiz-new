import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadTableAsCSV } from "@/services/seoService";
import { useSEOStore } from "@/store/seoStore";
import { SEOAnalysisSection } from "./seo/SEOAnalysisSection";

export function SEOTable() {
  const seoData = useSEOStore((state) => state.seoData);

  if (seoData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 bg-white rounded-xl shadow-sm border border-gray-100">
        Aucune donnée SEO disponible. Analysez une URL pour commencer.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {seoData.map((item) => (
        <div key={item.id} className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-600 mb-4">
            Analyse SEO pour : <span className="text-gray-700">{item.url}</span>
          </h2>
          
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 space-y-8">
              <SEOAnalysisSection
                title="Balise Title"
                type="single"
                current={item.current_title}
                suggested={item.suggested_title}
                context={item.title_context}
              />

              <SEOAnalysisSection
                title="Meta Description"
                type="single"
                current={item.current_description}
                suggested={item.suggested_description}
                context={item.description_context}
              />

              <SEOAnalysisSection
                title="H1"
                type="single"
                current={item.current_h1}
                suggested={item.suggested_h1}
                context={item.h1_context}
              />

              {item.current_h2s && item.current_h2s.length > 0 && (
                <SEOAnalysisSection
                  title="H2"
                  type="array"
                  current={item.current_h2s}
                  suggested={item.suggested_h2s}
                  context={item.h2s_context}
                />
              )}

              {item.current_h3s && item.current_h3s.length > 0 && (
                <SEOAnalysisSection
                  title="H3"
                  type="array"
                  current={item.current_h3s}
                  suggested={item.suggested_h3s}
                  context={item.h3s_context}
                />
              )}

              {item.current_h4s && item.current_h4s.length > 0 && (
                <SEOAnalysisSection
                  title="H4"
                  type="array"
                  current={item.current_h4s}
                  suggested={item.suggested_h4s}
                  context={item.h4s_context}
                />
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => downloadTableAsCSV(seoData)} variant="outline" className="gap-2 gradient-button">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}