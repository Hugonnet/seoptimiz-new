import { Navigation } from "@/components/Navigation";
import { URLForm } from "@/components/URLForm";
import { motion } from "framer-motion";
import { Search, Sparkles, History } from "lucide-react";
import { useSEOStore } from "@/store/seoStore";
import { downloadTableAsCSV } from "@/services/seoService";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const seoData = useSEOStore((state) => state.seoData);
  const navigate = useNavigate();

  const handleExport = () => {
    if (seoData.length === 0) {
      console.log("Aucune donnée à exporter");
      return;
    }
    downloadTableAsCSV(seoData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-[#FFFFFF] p-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 pt-12"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full gradient-button">
            Analyse SEO Intelligente
          </div>
          
          <h1 className="text-6xl font-bold tracking-tight text-[#6366F1]">
            SEOptimiz
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Optimisez votre référencement naturel avec notre outil d'analyse SEO avancé.
            Obtenez des recommandations personnalisées et exploitables.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-8"
        >
          <URLForm />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-xl bg-white shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-[#EEF2FF] rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-[#6366F1]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Analyse Approfondie</h3>
              <p className="text-gray-600">Scan complet des balises meta, titres et structure du contenu</p>
              <button 
                onClick={() => navigate('/analyse')}
                className="w-full mt-4 flex items-center justify-center gap-2 gradient-button rounded-lg py-3 px-4"
              >
                <Search className="w-5 h-5" />
                Lancer l'analyse
              </button>
            </div>
            
            <div className="p-6 rounded-xl bg-white shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-[#EEF2FF] rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-[#6366F1]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Recommandations IA</h3>
              <p className="text-gray-600">Suggestions intelligentes alimentées par des algorithmes avancés</p>
              <button 
                onClick={() => navigate('/analyse')}
                className="w-full mt-4 flex items-center justify-center gap-2 gradient-button rounded-lg py-3 px-4"
              >
                <Sparkles className="w-5 h-5" />
                Obtenir les recommandations
              </button>
            </div>
            
            <div className="p-6 rounded-xl bg-white shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-[#EEF2FF] rounded-lg flex items-center justify-center mb-4">
                <History className="w-6 h-6 text-[#6366F1]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Historique des analyses</h3>
              <p className="text-gray-600">Consultez et exportez l'historique de vos analyses SEO</p>
              <Button 
                onClick={() => navigate('/historique')}
                className="w-full mt-4 flex items-center justify-center gap-2 gradient-button rounded-lg py-3 px-4"
              >
                <History className="w-5 h-5" />
                Voir l'historique
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Index;