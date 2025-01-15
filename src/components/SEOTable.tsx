import { useSEOStore } from "@/store/seoStore";
import { SEOAnalysisSection } from "./seo/SEOAnalysisSection";
import { AdvancedAnalysisSection } from "./seo/AdvancedAnalysisSection";
import { SEOTableHeader } from "./seo/SEOTableHeader";
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

  console.log("SEO Data in SEOTable:", seoData);

  return (
    <div className="space-y-6">
      {seoData.map((item) => {
        console.log("Processing item:", item);
        return (
          <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <SEOTableHeader 
              url={item.url}
              showAdvanced={showAdvanced[item.id]}
              onToggleAdvanced={() => toggleAdvanced(item.id)}
            />
            
            <div className="p-6 space-y-8">
              {item.current_title && (
                <SEOAnalysisSection
                  title="Meta Title"
                  type="single"
                  current={item.current_title}
                  suggested={item.suggested_title || ''}
                  context={item.title_context}
                />
              )}
              
              {item.current_description && (
                <SEOAnalysisSection
                  title="Meta Description"
                  type="single"
                  current={item.current_description}
                  suggested={item.suggested_description || ''}
                  context={item.description_context}
                />
              )}
              
              {item.current_h1 && (
                <SEOAnalysisSection
                  title="H1"
                  type="single"
                  current={item.current_h1}
                  suggested={item.suggested_h1 || ''}
                  context={item.h1_context}
                />
              )}
              
              {item.current_h2s && item.current_h2s.length > 0 && (
                <SEOAnalysisSection
                  title="H2"
                  type="array"
                  current={item.current_h2s}
                  suggested={item.suggested_h2s || []}
                  context={item.h2s_context}
                />
              )}
              
              {item.current_h3s && item.current_h3s.length > 0 && (
                <SEOAnalysisSection
                  title="H3"
                  type="array"
                  current={item.current_h3s}
                  suggested={item.suggested_h3s || []}
                  context={item.h3s_context}
                />
              )}
              
              {item.current_h4s && item.current_h4s.length > 0 && (
                <SEOAnalysisSection
                  title="H4"
                  type="array"
                  current={item.current_h4s}
                  suggested={item.suggested_h4s || []}
                  context={item.h4s_context}
                />
              )}

              {showAdvanced[item.id] && (
                <AdvancedAnalysisSection
                  readabilityScore={Number(item.readability_score) || 0}
                  contentLength={Number(item.content_length) || 0}
                  internalLinks={item.internal_links || []}
                  externalLinks={item.external_links || []}
                  brokenLinks={item.broken_links || []}
                  imageAlts={item.image_alts || {}}
                  pageLoadSpeed={Number(item.page_load_speed) || 0}
                  mobileFriendly={item.mobile_friendly !== false}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}