import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { extractSEOMetadata } from "@/services/seoService";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";

export function URLForm() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
      <div className="relative">
        <Input
          type="url"
          placeholder="Entrez l'URL du site (ex: https://example.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="h-14 pl-6 pr-36 text-lg rounded-full border-purple-100 focus-visible:ring-purple-600"
          required
        />
        <Button 
          type="submit" 
          disabled={isLoading}
          className="absolute right-2 top-2 rounded-full bg-purple-600 hover:bg-purple-700 h-10 px-6"
        >
          <Search className="mr-2 h-4 w-4" />
          {isLoading ? "Analyse en cours..." : "Analyser"}
        </Button>
      </div>
    </form>
  );
}