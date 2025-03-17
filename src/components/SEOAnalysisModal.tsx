
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Trash2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSEOStore } from "@/store/seoStore";
import type { SEOAnalysis } from "@/store/seoStore";
import { SEOAnalysisContent } from "./seo/SEOAnalysisContent";

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-purple-800">Analyses pour {url}</h2>
      </div>

      <div className="border rounded-lg">
        {analyses.map((analysis) => (
          <div key={analysis.id} className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 flex justify-between items-center">
              <span className="text-sm text-purple-700">
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

            <ScrollArea className="h-[500px] px-6">
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
