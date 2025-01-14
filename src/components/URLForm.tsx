import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { extractSEOMetadata } from "@/services/seoService";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import { useSEOStore } from "@/store/seoStore";
import { supabase } from "@/integrations/supabase/client";
import { CompanyAutocomplete } from "./CompanyAutocomplete";
import { formatURL } from "@/utils/urlUtils";

export function URLForm() {
  const [domain, setDomain] = useState("");
  const [company, setCompany] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const addSEOData = useSEOStore((state) => state.addSEOData);

  const handleSimpleAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de l'entreprise est obligatoire",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);

    try {
      const formattedURL = formatURL(domain);
      console.log('URL formatée:', formattedURL);
      
      const seoData = await extractSEOMetadata(formattedURL);
      console.log('Données SEO extraites:', seoData);
      
      if (!seoData.title && !seoData.description) {
        throw new Error("Aucune donnée SEO n'a pu être extraite de cette URL");
      }

      const seoAnalysis = {
        url: formattedURL,
        company: company.trim(),
        current_title: seoData.title || "",
        current_description: seoData.description || "",
        current_h1: seoData.h1 || "",
        current_h2s: seoData.h2s || [],
        current_h3s: seoData.h3s || [],
        current_h4s: seoData.h4s || [],
      };

      const { data: insertedData, error: supabaseError } = await supabase
        .from('seo_analyses')
        .insert([seoAnalysis])
        .select()
        .single();

      if (supabaseError) {
        console.error('Erreur Supabase:', supabaseError);
        throw new Error("Erreur lors de la sauvegarde des données");
      }

      addSEOData(insertedData);
      
      toast({
        title: "Analyse terminée",
        description: "Les données SEO ont été extraites avec succès.",
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
    <form onSubmit={handleSimpleAnalysis} className="max-w-3xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-2 text-center">
        Entrez une url particulière
      </h2>
      <div className="space-y-4">
        <CompanyAutocomplete value={company} onChange={setCompany} />
        <Input
          type="text"
          placeholder="Ex: mondomaine.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="h-14 pl-6 text-lg rounded-full border-gray-200 focus-visible:ring-[#6366F1] bg-white shadow-sm w-full"
          required
        />
      </div>
      <div className="space-y-4">
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full h-12 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:opacity-90 text-white font-medium"
        >
          <Search className="mr-2 h-5 w-5" />
          {isLoading ? "Analyse..." : "Analyser"}
        </Button>
      </div>
    </form>
  );
}