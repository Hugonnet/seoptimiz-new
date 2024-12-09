import { Navigation } from "@/components/Navigation";
import { SEOTable } from "@/components/SEOTable";
import { URLForm } from "@/components/URLForm";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-400 to-pink-400 p-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 pt-12"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white font-medium text-sm mb-8">
            Analyse SEO Intelligente
          </div>
          
          <h1 className="text-6xl font-bold tracking-tight text-white">
            LumenSEO
          </h1>
          
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
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
            <div className="p-6 rounded-xl glass-card">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Analyse Approfondie</h3>
              <p className="text-white/80">Scan complet des balises meta, titres et structure du contenu</p>
            </div>
            
            <div className="p-6 rounded-xl glass-card">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Recommandations IA</h3>
              <p className="text-white/80">Suggestions intelligentes alimentées par des algorithmes avancés</p>
            </div>
            
            <div className="p-6 rounded-xl glass-card">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Export Détaillé</h3>
              <p className="text-white/80">Rapports complets et exploitables au format Excel</p>
            </div>
          </div>
          <SEOTable />
          
          <div className="flex justify-center items-center gap-8 mt-12">
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-6 h-6 text-white/80" />
              <div className="w-12 h-0.5 bg-white/80" />
              <ArrowRight className="w-6 h-6 text-white/80" />
            </div>
            <div className="flex items-center gap-2">
              <ArrowUp className="w-6 h-6 text-white/80" />
              <div className="w-12 h-0.5 bg-white/80" />
              <ArrowDown className="w-6 h-6 text-white/80" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;