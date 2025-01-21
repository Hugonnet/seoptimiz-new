import { useEffect, useState } from 'react';
import { URLForm } from "@/components/URLForm";
import { ActionCards } from "@/components/ActionCards";
import { StickyHeader } from "@/components/StickyHeader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSEOStore } from "@/store/seoStore";
import { motion } from "framer-motion";

export default function Index() {
  const { toast } = useToast();
  const setSEOData = useSEOStore((state) => state.setSEOData);
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
          title: "Erreur de chargement",
          description: "Impossible de charger les analyses SEO précédentes.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSEOData();
  }, [setSEOData, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-[#FFFFFF]">
      <StickyHeader />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8 sm:space-y-12"
        >
          <div className="space-y-2 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#6366F1] to-[#EC4899] text-transparent bg-clip-text">
              Analysez votre SEO en un clic
            </h1>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              Optimisez votre visibilité en ligne grâce à notre outil d'analyse SEO alimenté par l'IA
            </p>
          </div>

          <URLForm />
          
          {!isLoading && <ActionCards />}
        </motion.div>
      </div>
    </div>
  );
}