
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Trash2, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSEOStore } from "@/store/seoStore";
import type { SEOAnalysis } from "@/store/seoStore";
import { SEOAnalysisContent } from "./seo/SEOAnalysisContent";
import { downloadTableAsCSV } from "@/services/seoService";

interface SEOAnalysisModalProps {
  url: string;
  analyses: SEOAnalysis[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SEOAnalysisModal({ url, analyses }: SEOAnalysisModalProps) {
  const { toast } = useToast();
  const setSEOData = useSEOStore((state) => state.setSEOData);
  const seoData = useSEOStore((state) => state.seoData);

  const deleteAnalysis = async (id: number) => {
    try {
      const { error } = await supabase
        .from('seo_analyses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const updatedData = seoData.filter(item => item.id !== id);
      setSEOData(updatedData);

      toast({
        title: "Analyse supprimée",
        description: "L'analyse a été supprimée avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'analyse.",
        variant: "destructive",
      });
    }
  };
  
  const copyToClipboard = (analysis: SEOAnalysis, type: 'title' | 'description' | 'h1') => {
    let text = '';
    
    switch (type) {
      case 'title':
        text = analysis.suggested_title || '';
        break;
      case 'description':
        text = analysis.suggested_description || '';
        break;
      case 'h1':
        text = analysis.suggested_h1 || '';
        break;
    }
    
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        toast({
          title: "Copié !",
          description: `${type === 'title' ? 'Titre' : type === 'description' ? 'Description' : 'H1'} copié dans le presse-papier.`,
        });
      }).catch(err => {
        console.error('Erreur lors de la copie:', err);
        toast({
          title: "Erreur",
          description: "Impossible de copier le texte.",
          variant: "destructive",
        });
      });
    }
  };

  const handleExportCSV = () => {
    downloadTableAsCSV([...analyses]);
    toast({
      title: "Export réussi",
      description: "Les analyses ont été exportées au format CSV.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-purple-800">Analyses pour {url}</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 text-purple-700 border-purple-200 hover:bg-purple-50"
          onClick={handleExportCSV}
        >
          <Download className="h-4 w-4" />
          Exporter en CSV
        </Button>
      </div>

      <div className="border rounded-lg shadow-sm">
        {analyses.map((analysis) => (
          <div key={analysis.id} className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 flex justify-between items-center">
              <span className="text-sm text-purple-700 font-medium">
                {new Date(analysis.created_at!).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={() => deleteAnalysis(analysis.id)}
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            </div>

            <ScrollArea className="h-[600px] px-6 pb-8">
              <SEOAnalysisContent 
                analysis={analysis} 
                onCopy={(type) => copyToClipboard(analysis, type)}
              />
            </ScrollArea>
          </div>
        ))}
      </div>
    </div>
  );
}
