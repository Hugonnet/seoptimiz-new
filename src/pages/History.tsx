import { SEOTable } from "@/components/SEOTable";
import { Navigation } from "@/components/Navigation";
import { motion } from "framer-motion";

const History = () => {
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
          <h1 className="text-3xl font-bold text-[#6366F1]">
            Historique des analyses SEO
          </h1>
          
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