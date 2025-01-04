import { Navigation } from "@/components/Navigation";
import { SEOTable } from "@/components/SEOTable";
import { URLForm } from "@/components/URLForm";
import { motion } from "framer-motion";
import { Search, Sparkles, BarChart3 } from "lucide-react";

const Index = () => {
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
              <button className="w-full mt-4 flex items-center justify-center gap-2 gradient-button rounded-lg py-3 px-4">
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
              <button className="w-full mt-4 flex items-center justify-center gap-2 gradient-button rounded-lg py-3 px-4">
                <Sparkles className="w-5 h-5" />
                Obtenir les recommandations
              </button>
            </div>
            
            <div className="p-6 rounded-xl bg-white shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-[#EEF2FF] rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-[#6366F1]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Export Détaillé</h3>
              <p className="text-gray-600">Rapports complets et exploitables au format Excel</p>
              <button className="w-full mt-4 flex items-center justify-center gap-2 gradient-button rounded-lg py-3 px-4">
                <BarChart3 className="w-5 h-5" />
                Exporter le rapport
              </button>
            </div>
          </div>
          
          <SEOTable />
        </motion.div>
      </div>
    </div>
  );
}

export default Index;