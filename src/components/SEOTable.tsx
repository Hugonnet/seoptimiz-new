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

  const renderField = (title: string, content: string | string[] | null | undefined, fieldId: string) => {
    if (!content) return null;
    const displayContent = Array.isArray(content) ? content : [content];
    
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {displayContent.map((item, index) => (
          <div key={index} className="flex items-start justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-700 flex-grow">{item}</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyToClipboard(item, `${fieldId}-${index}`)}
              className="shrink-0"
            >
              {copiedField === `${fieldId}-${index}` ? (
                <Copy className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-gray-500" />
              )}
            </Button>
          </div>
        ))}
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
            {renderField("Meta Title", item.current_title, "title")}
            {renderField("Meta Description", item.current_description, "description")}
            {renderField("H1", item.current_h1, "h1")}
            {renderField("H2", item.current_h2s, "h2")}
            {renderField("H3", item.current_h3s, "h3")}
            {renderField("H4", item.current_h4s, "h4")}
          </div>
        </div>
      ))}
    </div>
  );
}