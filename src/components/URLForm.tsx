import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { extractSEOMetadata } from "@/services/seoService";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import { useSEOStore } from "@/store/seoStore";
import { supabase } from "@/integrations/supabase/client";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function URLForm() {
  const [domain, setDomain] = useState("");
  const [company, setCompany] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<string[]>([]);
  const { toast } = useToast();
  const addSEOData = useSEOStore((state) => state.addSEOData);

  useEffect(() => {
    if (company.length >= 3) {
      fetchCompanies();
    }
  }, [company]);

  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from('seo_analyses')
      .select('company')
      .ilike('company', `${company}%`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Récupérer les noms d'entreprises uniques
      const uniqueCompanies = Array.from(new Set(data.map(item => item.company)));
      setCompanies(uniqueCompanies);
      setOpen(true);
    }
  };

  const formatURL = (domain: string) => {
    let formattedURL = domain.toLowerCase().trim();
    formattedURL = formattedURL.replace(/^https?:\/\//, '');
    formattedURL = formattedURL.replace(/^www\./, '');
    formattedURL = formattedURL.replace(/\/$/, '');
    return `https://www.${formattedURL}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

      const seoAnalysis = {
        url: formattedURL,
        company: company.trim(),
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

      const { error: supabaseError } = await supabase
        .from('seo_analyses')
        .insert([seoAnalysis]);

      if (supabaseError) {
        console.error('Erreur Supabase:', supabaseError);
        throw new Error("Erreur lors de la sauvegarde des données");
      }

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
      <div className="space-y-4">
        <div className="space-y-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Input
                type="text"
                placeholder="Nom de l'entreprise"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="h-14 pl-6 text-lg rounded-full border-gray-200 focus-visible:ring-[#6366F1] bg-white shadow-sm w-full"
                required
                aria-required="true"
              />
            </PopoverTrigger>
            {companies.length > 0 && (
              <PopoverContent className="p-0" align="start">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {companies.map((companyName) => (
                        <CommandItem
                          key={companyName}
                          onSelect={() => {
                            setCompany(companyName);
                            setOpen(false);
                          }}
                        >
                          {companyName}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            )}
          </Popover>
          <p className="text-sm text-gray-500 ml-4">* Champ obligatoire</p>
        </div>
        <Input
          type="text"
          placeholder="Ex: mondomaine.com/mapage/"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="h-14 pl-6 text-lg rounded-full border-gray-200 focus-visible:ring-[#6366F1] bg-white shadow-sm w-full"
          required
        />
      </div>
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