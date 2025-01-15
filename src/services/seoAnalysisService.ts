import { supabase } from "@/integrations/supabase/client";
import { extractSEOMetadata } from "./seoService";
import { SEOAnalysis } from "@/store/seoStore";

export const analyzeSEO = async (url: string, company: string): Promise<SEOAnalysis> => {
  console.log('Analyse de l\'URL:', url);
  
  if (!url) {
    throw new Error("URL invalide");
  }

  try {
    // Validate URL format
    new URL(url);
  } catch (error) {
    throw new Error("Format d'URL invalide");
  }
  
  const seoData = await extractSEOMetadata(url);
  
  if (!seoData) {
    throw new Error("Impossible d'extraire les données SEO");
  }

  console.log('Appel à l\'Edge Function pour générer les suggestions');
  const { data: suggestions, error: suggestionsError } = await supabase.functions.invoke('generate-seo-suggestions', {
    body: {
      currentTitle: seoData.title,
      currentDescription: seoData.description,
      currentH1: seoData.h1,
      currentH2s: seoData.h2s,
      currentH3s: seoData.h3s,
      currentH4s: seoData.h4s,
      visibleText: seoData.visibleText,
      url: url,
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
        readability_score: suggestions.readability_score,
        content_length: suggestions.content_length,
        internal_links: suggestions.internal_links,
        external_links: suggestions.external_links,
        broken_links: suggestions.broken_links,
        image_alts: suggestions.image_alts,
        page_load_speed: suggestions.page_load_speed,
        mobile_friendly: suggestions.mobile_friendly,
      },
    ])
    .select()
    .single();

  if (insertError) {
    console.error('Erreur lors de l\'insertion des données:', insertError);
    throw insertError;
  }

  if (!analysisData) {
    throw new Error("Aucune donnée d'analyse n'a été retournée");
  }

  console.log('Données d\'analyse insérées:', analysisData);
  return analysisData;
};