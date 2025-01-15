import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Début de l\'analyse SEO');
    const { currentTitle, currentDescription, currentH1, currentH2s, currentH3s, currentH4s, visibleText } = await req.json();
    
    console.log('Données reçues:', {
      currentTitle,
      currentDescription,
      currentH1,
      currentH2s,
      currentH3s,
      currentH4s,
      visibleText
    });

    // Calculer les métriques de base
    const readabilityScore = calculateReadabilityScore(visibleText || []);
    const contentLength = calculateContentLength(visibleText || []);
    const { internalLinks, externalLinks, brokenLinks } = analyzeLinks(visibleText || []);
    const imageAlts = analyzeImageAlts(visibleText || []);
    const pageLoadSpeed = 2.5; // Valeur par défaut

    // Configuration OpenAI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    console.log('Appel à OpenAI pour les suggestions');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an SEO expert. Analyze the provided content and suggest improvements.'
          },
          {
            role: 'user',
            content: `Please analyze and suggest improvements for:
              Title: ${currentTitle}
              Description: ${currentDescription}
              H1: ${currentH1}
              H2s: ${currentH2s?.join(', ')}
              H3s: ${currentH3s?.join(', ')}
              H4s: ${currentH4s?.join(', ')}
              Content: ${visibleText?.join(' ')}`
          }
        ],
      }),
    });

    const data = await response.json();
    console.log('Réponse OpenAI reçue');

    const suggestions = data.choices[0].message.content;
    const lines = suggestions.split('\n');

    // Extraire les suggestions de manière plus robuste
    const suggestedTitle = lines.find(l => l.includes('Title'))?.replace('Title:', '').trim() || currentTitle;
    const suggestedDescription = lines.find(l => l.includes('Description'))?.replace('Description:', '').trim() || currentDescription;
    const suggestedH1 = lines.find(l => l.includes('H1'))?.replace('H1:', '').trim() || currentH1;

    const finalResponse = {
      suggested_title: suggestedTitle,
      suggested_description: suggestedDescription,
      suggested_h1: suggestedH1,
      suggested_h2s: currentH2s || [],
      suggested_h3s: currentH3s || [],
      suggested_h4s: currentH4s || [],
      title_context: "Suggestion d'amélioration pour le titre",
      description_context: "Suggestion d'amélioration pour la description",
      h1_context: "Suggestion d'amélioration pour le H1",
      h2s_context: [],
      h3s_context: [],
      h4s_context: [],
      readability_score: readabilityScore,
      content_length: contentLength,
      internal_links: internalLinks,
      external_links: externalLinks,
      broken_links: brokenLinks,
      image_alts: imageAlts,
      page_load_speed: pageLoadSpeed,
      mobile_friendly: true,
    };

    console.log('Réponse finale préparée');
    return new Response(JSON.stringify(finalResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erreur dans la fonction generate-seo-suggestions:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Fonctions utilitaires
function calculateReadabilityScore(text: string[]): number {
  if (!text || text.length === 0) return 0;
  const words = text.join(' ').split(/\s+/);
  return Math.min(100, Math.round((words.length / 100) * 50));
}

function calculateContentLength(text: string[]): number {
  if (!text || text.length === 0) return 0;
  return text.join(' ').split(/\s+/).length;
}

function analyzeLinks(text: string[]): {
  internalLinks: string[];
  externalLinks: string[];
  brokenLinks: string[];
} {
  return {
    internalLinks: [],
    externalLinks: [],
    brokenLinks: [],
  };
}

function analyzeImageAlts(text: string[]): Record<string, string> {
  return {};
}