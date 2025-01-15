import { Button } from "@/components/ui/button";
import { Download, Copy } from "lucide-react";
import { downloadTableAsCSV } from "@/services/seoService";
import { useSEOStore } from "@/store/seoStore";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function SEOTable() {
  const seoData = useSEOStore((state) => state.seoData);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  if (seoData.length === 0) {
    return (
      <div className="text-center py-3 sm:py-4 text-gray-600 bg-white rounded-lg shadow-sm border border-gray-100">
        Aucune donnée SEO disponible. Analysez une URL pour commencer.
      </div>
    );
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "Copié !",
        description: "Le texte a été copié dans le presse-papier.",
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le texte.",
        variant: "destructive",
      });
    }
  };

  const renderFieldPair = (
    title: string, 
    currentContent: string | string[] | null | undefined,
    suggestedContent: string | string[] | null | undefined,
    fieldId: string,
    context?: string
  ) => {
    if (!currentContent && !suggestedContent) return null;
    
    const currentArray = Array.isArray(currentContent) ? currentContent : [currentContent];
    const suggestedArray = Array.isArray(suggestedContent) ? suggestedContent : [suggestedContent];
    
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Colonne valeur actuelle */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Valeur actuelle</h4>
            {currentArray.map((item, index) => (
              item && (
                <div key={`current-${index}`} className="flex items-start justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-700 flex-grow">{item}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(item, `${fieldId}-current-${index}`)}
                    className="shrink-0"
                  >
                    {copiedField === `${fieldId}-current-${index}` ? (
                      <Copy className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              )
            ))}
          </div>

          {/* Colonne suggestion */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Suggestion</h4>
            {suggestedArray.map((item, index) => (
              item && (
                <div key={`suggested-${index}`} className="flex items-start justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-700 flex-grow">{item}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(item, `${fieldId}-suggested-${index}`)}
                    className="shrink-0"
                  >
                    {copiedField === `${fieldId}-suggested-${index}` ? (
                      <Copy className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              )
            ))}
          </div>
        </div>
        {context && (
          <p className="text-sm text-gray-600 mt-2 p-3 bg-gray-50 rounded-lg">
            {context}
          </p>
        )}
      </div>
    );
  };

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
            {renderFieldPair(
              "Meta Title",
              item.current_title,
              item.suggested_title,
              "title",
              item.title_context
            )}
            {renderFieldPair(
              "Meta Description",
              item.current_description,
              item.suggested_description,
              "description",
              item.description_context
            )}
            {renderFieldPair(
              "H1",
              item.current_h1,
              item.suggested_h1,
              "h1",
              item.h1_context
            )}
            {renderFieldPair(
              "H2",
              item.current_h2s,
              item.suggested_h2s,
              "h2",
              Array.isArray(item.h2s_context) ? item.h2s_context.join(" ") : item.h2s_context
            )}
            {renderFieldPair(
              "H3",
              item.current_h3s,
              item.suggested_h3s,
              "h3",
              Array.isArray(item.h3s_context) ? item.h3s_context.join(" ") : item.h3s_context
            )}
            {renderFieldPair(
              "H4",
              item.current_h4s,
              item.suggested_h4s,
              "h4",
              Array.isArray(item.h4s_context) ? item.h4s_context.join(" ") : item.h4s_context
            )}
          </div>
        </div>
      ))}
    </div>
  );
}