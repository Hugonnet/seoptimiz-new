import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { extractSEOMetadata } from "@/services/seoService";
import { useToast } from "@/hooks/use-toast";

export function URLForm() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Starting SEO analysis for URL:', url);
      const seoData = await extractSEOMetadata(url);
      console.log('SEO data extracted:', seoData);
      
      toast({
        title: "Analyse SEO terminée",
        description: "Les données ont été extraites avec succès.",
      });
    } catch (error) {
      console.error('Detailed error:', error);
      
      let errorMessage = "Impossible d'analyser l'URL. ";
      if (error.message.includes('Failed to fetch')) {
        errorMessage += "La fonction Edge n'est pas accessible. Veuillez vérifier que la fonction est déployée et activée dans votre projet Supabase.";
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 mb-8">
      <Input
        type="url"
        placeholder="Entrez l'URL à analyser"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1"
        required
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Analyse en cours..." : "Analyser"}
      </Button>
    </form>
  );
}