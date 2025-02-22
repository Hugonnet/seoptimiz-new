
import { SEOTable } from "@/components/SEOTable";
import { StickyHeader } from "@/components/StickyHeader";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useSEOStore } from "@/store/seoStore";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
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
import { useToast } from "@/hooks/use-toast";

const History = () => {
  const clearSEOData = useSEOStore((state) => state.clearSEOData);
  const setSEOData = useSEOStore((state) => state.setSEOData);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSEOData = async () => {
      try {
        const { data, error } = await supabase
          .from('seo_analyses')
          .select('*')
          .eq('archived', false)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setSEOData(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger l'historique des analyses",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSEOData();
  }, [setSEOData, toast]);

  const handleReset = async () => {
    try {
      // Supprimer toutes les données de la table seo_analyses
      const { error } = await supabase
        .from('seo_analyses')
        .update({ archived: true })
        .neq('id', 0); // Met à jour toutes les entrées

      if (error) throw error;

      // Vider le store local
      clearSEOData();

      toast({
        title: "Historique réinitialisé",
        description: "L'historique des analyses SEO a été archivé avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser l'historique",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-[#FFFFFF]">
      <StickyHeader />
      
      <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-3 sm:space-y-4 lg:space-y-6"
        >
          <div className="space-y-1 sm:space-y-2 px-1 sm:px-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#6366F1] to-[#EC4899] text-transparent bg-clip-text">
              Historique des analyses SEO
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Retrouvez ici l'historique complet de vos analyses SEO avec leurs recommandations.
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-4 sm:py-6 text-gray-600">
              Chargement de l'historique...
            </div>
          ) : (
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-xl p-1 sm:p-3 lg:p-4">
              <SEOTable />
            </div>
          )}

          <div className="flex justify-center pt-2 sm:pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="shadow hover:shadow-lg transition-all duration-300 gap-2 text-sm sm:text-base"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                  Réinitialiser l'historique
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action va archiver tout l'historique de vos analyses SEO.
                    Les données seront conservées mais masquées de l'interface.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleReset}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Confirmer l'archivage
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default History;
