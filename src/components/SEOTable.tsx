import { useState } from "react";
import { Table, TableBody } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useSEOStore } from "@/store/seoStore";
import { supabase } from "@/integrations/supabase/client";
import { SEOAnalysisModal } from "./SEOAnalysisModal";
import { SEOTableHeader } from "./SEOTableHeader";
import { SEOTableRow } from "./seo/SEOTableRow";

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

  const scrollToAnalysis = (url: string) => {
    const element = document.getElementById(`analysis-${encodeURIComponent(url)}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleViewAnalysis = (url: string) => {
    setSelectedUrl(url);
    setIsModalOpen(true);
    scrollToAnalysis(url);
  };

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
        <SEOTableHeader />
        <TableBody>
          {Object.entries(groupedAnalyses).map(([url, analyses]) => (
            <SEOTableRow
              key={url}
              url={url}
              analyses={analyses}
              selectedUrl={selectedUrl}
              onViewAnalysis={handleViewAnalysis}
              onDeleteAnalysis={deleteAnalysesByUrl}
            />
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