import { supabase } from "@/integrations/supabase/client";

export interface SEOSuggestionRequest {
  currentTitle: string;
  currentDescription: string;
  currentH1: string;
  currentH2s: string[];
  currentH3s: string[];
  currentH4s: string[];
}

export const generateSEOSuggestions = async (data: SEOSuggestionRequest) => {
  console.log('Envoi des données pour suggestions:', data);
  
  const { data: suggestions, error } = await supabase.functions.invoke('generate-seo-suggestions', {
    body: data,
  });

  if (error) {
    console.error('Erreur lors de la génération des suggestions:', error);
    throw new Error("Erreur lors de la génération des suggestions");
  }

  console.log('Suggestions reçues:', suggestions);
  return suggestions;
};