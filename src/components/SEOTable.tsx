import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSEOStore } from "@/store/seoStore";
import { supabase } from "@/integrations/supabase/client";
import { SEOAnalysisModal } from "./SEOAnalysisModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function SEOTable() {
  const { toast } = useToast();
  const seoData = useSEOStore((state) => state.seoData);
  const setSEOData = useSEOStore((state) => state.setSEOData);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const deleteAnalysesByUrl = async (url: string) => {
    try {
      const { error } = await supabase
        .from('seo_analyses')
        .delete()
        .eq('url', url);

      if (error) throw error;

      // Mettre à jour le state local
      const updatedData = seoData.filter(item => item.url !== url);
      setSEOData(updatedData);

      toast({
        title: "Analyses supprimées",
        description: `Toutes les analyses pour ${url} ont été supprimées avec succès.`,
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer les analyses.",
        variant: "destructive",
      });
    }
  };

  // Grouper les analyses par URL
  const groupedAnalyses = seoData.reduce((acc, analysis) => {
    const url = analysis.url;
    if (!acc[url]) {
      acc[url] = [];
    }
    acc[url].push(analysis);
    return acc;
  }, {} as Record<string, typeof seoData>);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>URL analysée</TableHead>
            <TableHead>Nombre d'analyses</TableHead>
            <TableHead>Dernière analyse</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(groupedAnalyses).map(([url, analyses]) => (
            <TableRow key={url}>
              <TableCell className="font-medium">{url}</TableCell>
              <TableCell>{analyses.length}</TableCell>
              <TableCell>
                {new Date(analyses[0].created_at!).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    setSelectedUrl(url);
                    setIsModalOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4" />
                  Voir les analyses
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="gap-2"
                      onClick={() => setSelectedUrl(url)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action va supprimer toutes les analyses pour {url}.
                        Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => selectedUrl && deleteAnalysesByUrl(selectedUrl)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedUrl && (
        <SEOAnalysisModal
          url={selectedUrl}
          analyses={groupedAnalyses[selectedUrl]}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </div>
  );
}