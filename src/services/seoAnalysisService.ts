import { supabase } from "@/integrations/supabase/client";
import { extractSEOMetadata } from "./seoService";
import { SEOAnalysis } from "@/store/seoStore";

export const analyzeSEO = async (url: string, company: string): Promise<SEOAnalysis> => {
  console.log('Analyse de l\'URL:', url);
  
  // Ensure URL is properly formatted
  let formattedUrl = url;
  try {
    const urlObject = new URL(url);
    // Remove any trailing colons from the hostname
    urlObject.hostname = urlObject.hostname.replace(/:+$/, '');
    formattedUrl = urlObject.toString();
    console.log('URL formatée:', formattedUrl);
  } catch (error) {
    console.error('Erreur de formatage d\'URL:', error);
    throw new Error("URL invalide");
  }
  
  const seoData = await extractSEOMetadata(formattedUrl);
  
  if (!seoData) {
    throw new Error("Impossible d'extraire les données SEO");
  }

  // Test page speed
  console.log('Test de vitesse pour:', formattedUrl);
  const { data: speedData, error: speedError } = await supabase.functions.invoke('test-page-speed', {
    body: { url: formattedUrl }
  });

  if (speedError) {
    console.error('Erreur lors du test de vitesse:', speedError);
    throw speedError;
  }

  console.log('Résultats du test de vitesse:', speedData);

  console.log('Appel à l\'Edge Function pour générer les suggestions');
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
        url: formattedUrl,
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
        page_load_speed: speedData.loadTime,
      },
    ])
    .select()
    .single();

  if (insertError) {
    throw insertError;
  }

  if (!analysisData) {
    throw new Error("Aucune donnée d'analyse n'a été retournée");
  }

  return analysisData;
};