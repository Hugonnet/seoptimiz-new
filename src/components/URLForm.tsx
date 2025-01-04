import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { extractSEOMetadata } from "@/services/seoService";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import { useSEOStore } from "@/store/seoStore";
import { supabase } from "@/integrations/supabase/client";

export function URLForm() {
  const [domain, setDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const addSEOData = useSEOStore((state) => state.addSEOData);

  const formatURL = (domain: string) => {
    let formattedURL = domain.toLowerCase().trim();
    
    // Supprimer http:// ou https:// s'ils existent
    formattedURL = formattedURL.replace(/^https?:\/\//, '');
    
    // Supprimer www. s'il existe
    formattedURL = formattedURL.replace(/^www\./, '');
    
    // Supprimer les slashes à la fin
    formattedURL = formattedURL.replace(/\/$/, '');
    
    // Ajouter le préfixe complet
    return `https://www.${formattedURL}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formattedURL = formatURL(domain);
      console.log('URL formatée:', formattedURL);
      
      const seoData = await extractSEOMetadata(formattedURL);
      console.log('Données SEO extraites:', seoData);
      
      if (!seoData.title && !seoData.description) {
        throw new Error("Aucune donnée SEO n'a pu être extraite de cette URL");
      }

      // Obtenir les suggestions d'OpenAI
      const { data: suggestions, error: aiError } = await supabase.functions.invoke('generate-seo-suggestions', {
        body: {
          currentTitle: seoData.title,
          currentDescription: seoData.description,
          currentH1: seoData.h1,
          currentH2s: seoData.h2s,
          currentH3s: seoData.h3s,
          currentH4s: seoData.h4s,
        },
      });

      if (aiError) {
        console.error('Erreur IA:', aiError);
        throw new Error("Erreur lors de la génération des suggestions");
      }

      // Préparer les données pour le stockage et l'affichage
      const seoAnalysis = {
        url: formattedURL,
        current_title: seoData.title || "",
        suggested_title: suggestions.suggested_title,
        current_description: seoData.description || "",
        suggested_description: suggestions.suggested_description,
        current_h1: seoData.h1 || "",
        suggested_h1: suggestions.suggested_h1,
        current_h2s: seoData.h2s || [],
        suggested_h2s: suggestions.suggested_h2s,
        current_h3s: seoData.h3s || [],
        suggested_h3s: suggestions.suggested_h3s,
        current_h4s: seoData.h4s || [],
        suggested_h4s: suggestions.suggested_h4s
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
        description: "Les données SEO ont été extraites et optimisées avec succès.",
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
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-2 text-center">
        Entrez une url particulière
      </h2>
      <Input
        type="text"
        placeholder="Ex: mondomaine.com/mapage/"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        className="h-14 pl-6 text-lg rounded-full border-gray-200 focus-visible:ring-[#6366F1] bg-white shadow-sm w-full"
        required
      />
      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full h-12 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:opacity-90 text-white font-medium"
      >
        <Search className="mr-2 h-5 w-5" />
        {isLoading ? "Analyse..." : "Analyser"}
      </Button>
    </form>
  );
}