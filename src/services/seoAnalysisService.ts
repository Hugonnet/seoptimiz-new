
import { supabase } from "@/integrations/supabase/client";
import { extractSEOMetadata } from "./seoService";
import { SEOAnalysis } from "@/store/seoStore";

// Enhanced helper function to clean text from CSS classes and other unwanted elements
const cleanText = (text: string | null | undefined): string => {
  if (!text) return "";
  
  // Significantly improved cleaning pattern
  return text
    // Remove all CSS-like class patterns
    .replace(/\b[a-z]+[-][a-z]+[-][a-z]+\b/g, ' ')
    .replace(/\b[a-z]+[-][a-z]+\b/g, ' ')
    // Remove specific patterns identified in the data
    .replace(/account|android|arrow|cart|menu|categories|chevron|opening/g, ' ')
    .replace(/circle|tinder|trello|tripadvisor|tumblr|twitch|twitter|viber|vimeo|vk/g, ' ')
    .replace(/ontakt|website|wechat|whatsapp|windows|wishlist|xing|yelp|youtube|zoom/g, ' ')
    // Remove common icon names
    .replace(/icon-[a-z-]+/g, ' ')
    // Remove dashes and repeated dashes
    .replace(/[-]{2,}/g, ' ')
    // Clean up extra spaces
    .replace(/\s{2,}/g, ' ')
    .trim();
};

// Helper function to clean array items
const cleanArray = (arr: string[] | null | undefined): string[] => {
  if (!arr || !Array.isArray(arr)) return [];
  return arr.map(item => cleanText(item)).filter(item => item.length > 0);
};

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

  // Check if we hit a bot protection page
  const isProtectedPage = seoData.isProtectedPage === true;
  
  // Add a warning to the company name if bot protection was detected
  const enhancedCompany = isProtectedPage 
    ? `${company} [ATTENTION: Protection anti-bot détectée]` 
    : company;

  // Clean the extracted SEO data
  const cleanedSeoData = {
    title: cleanText(seoData.title),
    description: cleanText(seoData.description),
    h1: cleanText(seoData.h1),
    h2s: cleanArray(seoData.h2s),
    h3s: cleanArray(seoData.h3s),
    h4s: cleanArray(seoData.h4s),
    visibleText: cleanArray(seoData.visibleText),
    internalLinks: seoData.internalLinks,
    externalLinks: seoData.externalLinks,
    brokenLinks: seoData.brokenLinks,
    isProtectedPage: isProtectedPage
  };

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

  // If it's a bot protection page, add a note to the context
  const botProtectionContext = isProtectedPage 
    ? "ATTENTION: Une page de protection anti-bot a été détectée au lieu du contenu réel du site. Les suggestions ci-dessous sont basées sur le contenu de la page de protection et non sur le contenu réel du site."
    : "";

  console.log('Appel à l\'Edge Function pour générer les suggestions');
  const { data: suggestions, error: suggestionsError } = await supabase.functions.invoke('generate-seo-suggestions', {
    body: {
      currentTitle: cleanedSeoData.title,
      currentDescription: cleanedSeoData.description,
      currentH1: cleanedSeoData.h1,
      currentH2s: cleanedSeoData.h2s,
      currentH3s: cleanedSeoData.h3s,
      currentH4s: cleanedSeoData.h4s,
      isProtectedPage: isProtectedPage,
    },
  });

  if (suggestionsError) {
    console.error('Erreur lors de la génération des suggestions:', suggestionsError);
    throw suggestionsError;
  }

  console.log('Suggestions générées:', suggestions);

  // Add the bot protection warning to each context if detected
  let enhancedSuggestions = { ...suggestions };
  
  if (isProtectedPage) {
    enhancedSuggestions = {
      ...suggestions,
      title_context: botProtectionContext + (suggestions.title_context ? " " + suggestions.title_context : ""),
      description_context: botProtectionContext + (suggestions.description_context ? " " + suggestions.description_context : ""),
      h1_context: botProtectionContext + (suggestions.h1_context ? " " + suggestions.h1_context : ""),
    };
  }

  const { data: analysisData, error: insertError } = await supabase
    .from('seo_analyses')
    .insert([
      {
        url: formattedUrl,
        company: enhancedCompany,
        current_title: cleanedSeoData.title,
        current_description: cleanedSeoData.description,
        current_h1: cleanedSeoData.h1,
        current_h2s: cleanedSeoData.h2s,
        current_h3s: cleanedSeoData.h3s,
        current_h4s: cleanedSeoData.h4s,
        visible_text: cleanedSeoData.visibleText,
        suggested_title: enhancedSuggestions.suggested_title,
        suggested_description: enhancedSuggestions.suggested_description,
        suggested_h1: enhancedSuggestions.suggested_h1,
        suggested_h2s: enhancedSuggestions.suggested_h2s,
        suggested_h3s: enhancedSuggestions.suggested_h3s,
        suggested_h4s: enhancedSuggestions.suggested_h4s,
        title_context: enhancedSuggestions.title_context,
        description_context: enhancedSuggestions.description_context,
        h1_context: enhancedSuggestions.h1_context,
        h2s_context: enhancedSuggestions.h2s_context,
        h3s_context: enhancedSuggestions.h3s_context,
        h4s_context: enhancedSuggestions.h4s_context,
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
