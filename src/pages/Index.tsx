import { Navigation } from "@/components/Navigation";
import { SEOTable } from "@/components/SEOTable";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold tracking-tight">Prism SEO</h1>
          <p className="text-lg text-muted-foreground">
            Analysez et optimisez votre SEO avec précision
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Navigation />
          <SEOTable />
        </motion.div>
      </div>
    </div>
  );
};

export default Index;