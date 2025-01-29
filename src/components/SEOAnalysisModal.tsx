import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSEOStore } from "@/store/seoStore";
import type { SEOAnalysis } from "@/store/seoStore";

interface SEOAnalysisModalProps {
  url: string;
  analyses: SEOAnalysis[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SEOAnalysisModal({ url, analyses, open, onOpenChange }: SEOAnalysisModalProps) {
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

      // Mettre à jour le state local
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Analyses pour {url}</DialogTitle>
          <DialogDescription>
            Historique complet des analyses SEO pour cette URL
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow">
          <div className="space-y-4 p-4">
            {analyses.map((analysis) => (
              <div
                key={analysis.id}
                className="border rounded-lg p-4 space-y-3 bg-white shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="text-sm text-gray-500">
                    {new Date(analysis.created_at!).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.page_load_speed && (
                    <div className="space-y-1">
                      <div className="font-medium">Vitesse de chargement</div>
                      <div className="text-sm">{analysis.page_load_speed.toFixed(2)}s</div>
                    </div>
                  )}
                  {analysis.content_length && (
                    <div className="space-y-1">
                      <div className="font-medium">Longueur du contenu</div>
                      <div className="text-sm">{analysis.content_length} caractères</div>
                    </div>
                  )}
                  {analysis.readability_score && (
                    <div className="space-y-1">
                      <div className="font-medium">Score de lisibilité</div>
                      <div className="text-sm">{analysis.readability_score}/100</div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {analysis.current_title && analysis.suggested_title && (
                    <div className="space-y-1">
                      <div className="font-medium">Titre</div>
                      <div className="text-sm bg-gray-50 p-2 rounded">
                        <div>Actuel: {analysis.current_title}</div>
                        <div className="text-green-600">Suggéré: {analysis.suggested_title}</div>
                      </div>
                    </div>
                  )}
                  
                  {analysis.current_description && analysis.suggested_description && (
                    <div className="space-y-1">
                      <div className="font-medium">Description</div>
                      <div className="text-sm bg-gray-50 p-2 rounded">
                        <div>Actuelle: {analysis.current_description}</div>
                        <div className="text-green-600">Suggérée: {analysis.suggested_description}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}