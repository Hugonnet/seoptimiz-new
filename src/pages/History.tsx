import { SEOTable } from "@/components/SEOTable";
import { Navigation } from "@/components/Navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useSEOStore } from "@/store/seoStore";
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
import { useToast } from "@/components/ui/use-toast";

const History = () => {
  const resetSEOData = useSEOStore((state) => state.resetSEOData);
  const { toast } = useToast();

  const handleReset = () => {
    resetSEOData();
    toast({
      title: "Historique réinitialisé",
      description: "L'historique des analyses SEO a été effacé avec succès.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-[#FFFFFF] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <Navigation />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-[#6366F1]">
              Historique des analyses SEO
            </h1>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Réinitialiser l'historique
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action va supprimer définitivement tout l'historique de vos analyses SEO.
                    Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>
                    Confirmer la suppression
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          <p className="text-gray-600">
            Retrouvez ici l'historique complet de vos analyses SEO avec leurs recommandations.
          </p>

          <SEOTable />
        </motion.div>
      </div>
    </div>
  );
};

export default History;