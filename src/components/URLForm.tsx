import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { CompanyAutocomplete } from "./CompanyAutocomplete";
import { extractSEOMetadata } from "@/services/seoService";
import { useSEOStore } from "@/store/seoStore";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function URLForm() {
  const [domain, setDomain] = useState("");
  const [company, setCompany] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const addSEOData = useSEOStore((state) => state.addSEOData);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!company) {
      toast({
        title: "Erreur",
        description: "Le nom de l'entreprise est obligatoire",
        variant: "destructive",
      });
      return;
    }

    if (!domain) {
      toast({
        title: "Erreur",
        description: "L'URL est obligatoire",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Formatage basique de l'URL
      let url = domain.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      console.log('Analyse de l\'URL:', url);
      
      const seoData = await extractSEOMetadata(url);
      
      if (!seoData) {
        throw new Error("Impossible d'extraire les données SEO");
      }

      // Appel à l'Edge Function pour générer les suggestions
      const { data: suggestions, error: suggestionsError } = await supabase.functions.invoke('generate-seo-suggestions', {
        body: {
          currentTitle: seoData.title,
          currentDescription: seoData.description,
          currentH1: seoData.h1,
          currentH2s: seoData.h2s,
          currentH3s: seoData.h3s,
          currentH4s: seoData.h4s,
        },
      });

      if (suggestionsError) {
        console.error('Erreur lors de la génération des suggestions:', suggestionsError);
        throw suggestionsError;
      }

      console.log('Suggestions générées:', suggestions);

      const { data: analysisData, error: insertError } = await supabase
        .from('seo_analyses')
        .insert([
          {
            url: url,
            company: company,
            current_title: seoData.title,
            current_description: seoData.description,
            current_h1: seoData.h1,
            current_h2s: seoData.h2s,
            current_h3s: seoData.h3s,
            current_h4s: seoData.h4s,
            visible_text: seoData.visibleText,
            suggested_title: suggestions.suggested_title,
            suggested_description: suggestions.suggested_description,
            suggested_h1: suggestions.suggested_h1,
            suggested_h2s: suggestions.suggested_h2s,
            suggested_h3s: suggestions.suggested_h3s,
            suggested_h4s: suggestions.suggested_h4s,
            title_context: suggestions.title_context,
            description_context: suggestions.description_context,
            h1_context: suggestions.h1_context,
            h2s_context: suggestions.h2s_context,
            h3s_context: suggestions.h3s_context,
            h4s_context: suggestions.h4s_context,
          },
        ])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      if (analysisData) {
        addSEOData(analysisData);
        toast({
          title: "Succès",
          description: "L'analyse SEO a été effectuée avec succès.",
        });
        setDomain("");
      }

    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'analyse",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-2 text-center">
        Entrez une URL à analyser
      </h2>
      <div className="space-y-4">
        <CompanyAutocomplete value={company} onChange={setCompany} />
        <Input
          type="text"
          placeholder="Ex: www.mondomaine.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="h-14 pl-6 text-lg rounded-full border-gray-200 focus-visible:ring-[#6366F1] bg-white shadow-sm w-full"
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:opacity-90 text-white font-medium"
        >
          <Search className="mr-2 h-5 w-5" />
          {isLoading ? "Analyse en cours..." : "Analyser"}
        </Button>
      </div>
    </form>
  );
}