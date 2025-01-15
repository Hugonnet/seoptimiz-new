import { URLForm } from "@/components/URLForm";
import { motion } from "framer-motion";
import { Search, Download, History } from "lucide-react";
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
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-[#F8F9FF] to-[#FFFFFF] -mt-8 -mx-4 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 md:space-y-6 pt-8 md:pt-12"
        >
          <div className="inline-flex items-center px-3 py-1 md:px-4 md:py-2 rounded-full gradient-button text-sm md:text-base">
            Analyse SEO Intelligente
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#6366F1]">
            SEOptimiz
          </h1>
          
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Optimisez votre référencement naturel avec notre outil d'analyse SEO avancé.
            Densité des mots-clés, lisibilité, liens et performance mobile.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6 md:space-y-8"
        >
          <URLForm />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
            <div className="p-4 md:p-6 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#EEF2FF] rounded-lg flex items-center justify-center mb-4">
                <Search className="w-5 h-5 md:w-6 md:h-6 text-[#6366F1]" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-900">Analyse SEO Avancée</h3>
              <p className="text-sm md:text-base text-gray-600 mb-4">
                Densité des mots-clés, lisibilité, liens et performance mobile
              </p>
              <button 
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center gap-2 gradient-button rounded-lg py-2 md:py-3 px-3 md:px-4 text-sm md:text-base"
              >
                <Search className="w-4 h-4 md:w-5 md:h-5" />
                Analyse avancée
              </button>
            </div>
            
            <div className="p-4 md:p-6 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#EEF2FF] rounded-lg flex items-center justify-center mb-4">
                <Download className="w-5 h-5 md:w-6 md:h-6 text-[#6366F1]" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-900">Exports</h3>
              <p className="text-sm md:text-base text-gray-600 mb-4">Exportez et gérez vos analyses SEO par entreprise</p>
              <button 
                onClick={() => navigate('/exports')}
                className="w-full flex items-center justify-center gap-2 gradient-button rounded-lg py-2 md:py-3 px-3 md:px-4 text-sm md:text-base"
              >
                <Download className="w-4 h-4 md:w-5 md:h-5" />
                Voir les exports
              </button>
            </div>
            
            <div className="p-4 md:p-6 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#EEF2FF] rounded-lg flex items-center justify-center mb-4">
                <History className="w-5 h-5 md:w-6 md:h-6 text-[#6366F1]" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-900">Historique des analyses</h3>
              <p className="text-sm md:text-base text-gray-600 mb-4">Consultez et exportez l'historique de vos analyses SEO</p>
              <Button 
                onClick={() => navigate('/historique')}
                className="w-full flex items-center justify-center gap-2 gradient-button rounded-lg py-2 md:py-3 px-3 md:px-4 text-sm md:text-base"
              >
                <History className="w-4 h-4 md:w-5 md:h-5" />
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