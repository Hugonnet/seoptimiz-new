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

  const handleReset = () => {
    clearSEOData();
    toast({
      title: "Historique réinitialisé",
      description: "L'historique des analyses SEO a été effacé avec succès.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-[#FFFFFF]">
      <StickyHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#6366F1] to-[#EC4899] text-transparent bg-clip-text">
              Historique des analyses SEO
            </h1>
            <p className="text-gray-600 text-lg">
              Retrouvez ici l'historique complet de vos analyses SEO avec leurs recommandations.
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-gray-600">
              Chargement de l'historique...
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-xl p-6">
              <SEOTable />
            </div>
          )}

          <div className="flex justify-center pt-8">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="shadow-lg hover:shadow-xl transition-all duration-300 gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Réinitialiser l'historique
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action va supprimer définitivement tout l'historique de vos analyses SEO.
                    Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleReset}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Confirmer la suppression
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