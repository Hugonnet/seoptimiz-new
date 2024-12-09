import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { extractSEOMetadata } from "@/services/seoService";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import { useSEOStore } from "@/store/seoStore";
import { supabase } from "@/integrations/supabase/client";

export function URLForm() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const addSEOData = useSEOStore((state) => state.addSEOData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Démarrage de l\'analyse SEO pour:', url);
      const seoData = await extractSEOMetadata(url);
      console.log('Données SEO extraites:', seoData);
      
      if (!seoData.title && !seoData.description) {
        throw new Error("Aucune donnée SEO n'a pu être extraite de cette URL");
      }

      // Préparer les données pour le stockage et l'affichage
      const seoAnalysis = {
        url,
        current_title: seoData.title || "",
        suggested_title: `${seoData.title || ""} - Version Optimisée`,
        current_description: seoData.description || "",
        suggested_description: `${seoData.description || ""} (Optimisé pour le SEO)`,
        current_h1: seoData.h1 || "",
        suggested_h1: "Un titre H1 optimisé pour le SEO",
        current_h2s: seoData.h2s || [],
        suggested_h2s: (seoData.h2s || []).map(h2 => `${h2} (Optimisé)`),
        current_h3s: seoData.h3s || [],
        suggested_h3s: (seoData.h3s || []).map(h3 => `${h3} (Optimisé)`),
        current_h4s: seoData.h4s || [],
        suggested_h4s: (seoData.h4s || []).map(h4 => `${h4} (Optimisé)`)
      };

      // Sauvegarder dans Supabase
      const { error: supabaseError } = await supabase
        .from('seo_analyses')
        .insert([seoAnalysis]);

      if (supabaseError) {
        console.error('Erreur Supabase:', supabaseError);
        throw new Error("Erreur lors de la sauvegarde des données");
      }

      // Mettre à jour le store local
      addSEOData(seoAnalysis);
      
      toast({
        title: "Analyse terminée",
        description: "Les données SEO ont été extraites et sauvegardées avec succès.",
      });
    } catch (error) {
      console.error('Erreur détaillée:', error);
      
      toast({
        title: "Erreur",
        description: error.message || "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
      <div className="relative">
        <Input
          type="url"
          placeholder="Entrez l'URL du site (ex: https://example.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="h-14 pl-6 pr-36 text-lg rounded-full border-gray-200 focus-visible:ring-[#6366F1] bg-white"
          required
        />
        <Button 
          type="submit" 
          disabled={isLoading}
          className="absolute right-2 top-2 rounded-full gradient-button h-10 px-6"
        >
          <Search className="mr-2 h-4 w-4" />
          {isLoading ? "Analyse en cours..." : "Analyser"}
        </Button>
      </div>
    </form>
  );
}