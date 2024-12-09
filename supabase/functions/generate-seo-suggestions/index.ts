import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { currentTitle, currentDescription, currentH1, currentH2s, currentH3s, currentH4s, visibleText } = await req.json();

    console.log('Données reçues pour analyse:', { 
      currentTitle, 
      currentDescription, 
      currentH1, 
      currentH2s, 
      currentH3s, 
      currentH4s,
      visibleText 
    });

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
            content: 'Tu es un expert SEO de renommée internationale. Analyse le contenu fourni et suggère des améliorations SEO.'
          },
          {
            role: 'user',
            content: `Analyse et optimise le contenu SEO suivant :
              Titre actuel : "${currentTitle}"
              Description actuelle : "${currentDescription}"
              H1 actuel : "${currentH1}"
              H2s actuels : "${currentH2s?.join(', ')}"
              H3s actuels : "${currentH3s?.join(', ')}"
              H4s actuels : "${currentH4s?.join(', ')}"
              Textes visibles : "${visibleText?.join(' ')}"
              
              Fournis des suggestions d'amélioration pour chaque élément.`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur OpenAI: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Réponse OpenAI brute:', data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Format de réponse OpenAI invalide');
    }

    // Traiter la réponse pour extraire les suggestions
    const content = data.choices[0].message.content;
    console.log('Contenu de la réponse:', content);

    // Structurer les suggestions
    const suggestions = {
      suggested_title: currentTitle, // Par défaut, garder les valeurs actuelles
      suggested_description: currentDescription,
      suggested_h1: currentH1,
      suggested_h2s: currentH2s || [],
      suggested_h3s: currentH3s || [],
      suggested_h4s: currentH4s || [],
      title_context: "Suggestion générée par IA",
      description_context: "Suggestion générée par IA",
      h1_context: "Suggestion générée par IA",
      h2s_context: ["Suggestion générée par IA"],
      h3s_context: ["Suggestion générée par IA"],
      h4s_context: ["Suggestion générée par IA"],
    };

    // Extraire les suggestions du contenu de l'IA
    try {
      // Analyser le contenu pour extraire les suggestions spécifiques
      if (content.includes('Titre suggéré')) {
        suggestions.suggested_title = content.match(/Titre suggéré[^\n]*/)?.[0]?.split(':')?.[1]?.trim() || currentTitle;
      }
      if (content.includes('Description suggérée')) {
        suggestions.suggested_description = content.match(/Description suggérée[^\n]*/)?.[0]?.split(':')?.[1]?.trim() || currentDescription;
      }
      // ... ajouter d'autres extractions si nécessaire
    } catch (parseError) {
      console.error('Erreur lors du parsing des suggestions:', parseError);
      // En cas d'erreur de parsing, on garde les valeurs par défaut
    }

    console.log('Suggestions structurées:', suggestions);

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erreur dans la fonction generate-seo-suggestions:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Une erreur est survenue lors de la génération des suggestions SEO' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});