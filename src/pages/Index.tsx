import { URLForm } from "@/components/URLForm";
import { motion } from "framer-motion";

const Index = () => {
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
            Obtenez des insights détaillés sur la performance de votre site.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6 md:space-y-8"
        >
          <URLForm />
        </motion.div>
      </div>
    </div>
  );
}

export default Index;