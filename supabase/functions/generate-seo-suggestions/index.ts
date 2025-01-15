import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentTitle, currentDescription, currentH1, currentH2s, currentH3s, currentH4s } = await req.json();
    console.log('Données reçues:', { currentTitle, currentDescription, currentH1, currentH2s, currentH3s, currentH4s });

    if (!openAIApiKey) {
      throw new Error('La clé API OpenAI n\'est pas configurée');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Tu es un expert SEO spécialisé dans l'optimisation de contenu en français.
            Ta tâche est de générer des suggestions d'optimisation SEO pour chaque élément HTML fourni.
            Fournis des suggestions pertinentes et spécifiques pour améliorer le référencement.`
          },
          {
            role: 'user',
            content: `Analyse et optimise les éléments SEO suivants :
            
            TITRE : "${currentTitle || ''}"
            DESCRIPTION : "${currentDescription || ''}"
            H1 : "${currentH1 || ''}"
            H2s : ${JSON.stringify(currentH2s || [])}
            H3s : ${JSON.stringify(currentH3s || [])}
            H4s : ${JSON.stringify(currentH4s || [])}
            
            Pour chaque élément :
            1. Analyse sa pertinence SEO
            2. Suggère une version optimisée
            3. Explique pourquoi cette optimisation est meilleure`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur OpenAI:', errorText);
      throw new Error(`Erreur OpenAI: ${errorText}`);
    }

    const data = await response.json();
    console.log('Réponse OpenAI:', data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Réponse OpenAI invalide ou vide');
    }

    const suggestions = {
      suggested_title: "Suggestion en cours de génération...",
      suggested_description: "Suggestion en cours de génération...",
      suggested_h1: "Suggestion en cours de génération...",
      suggested_h2s: currentH2s?.map(() => "Suggestion en cours de génération...") || [],
      suggested_h3s: currentH3s?.map(() => "Suggestion en cours de génération...") || [],
      suggested_h4s: currentH4s?.map(() => "Suggestion en cours de génération...") || [],
      title_context: "Analyse en cours...",
      description_context: "Analyse en cours...",
      h1_context: "Analyse en cours...",
      h2s_context: currentH2s?.map(() => "Analyse en cours...") || [],
      h3s_context: currentH3s?.map(() => "Analyse en cours...") || [],
      h4s_context: currentH4s?.map(() => "Analyse en cours...") || [],
    };

    // Parse la réponse d'OpenAI pour extraire les suggestions
    const content = data.choices[0].message.content;
    const parsedSuggestions = JSON.parse(content);

    suggestions.suggested_title = parsedSuggestions.suggested_title || suggestions.suggested_title;
    suggestions.suggested_description = parsedSuggestions.suggested_description || suggestions.suggested_description;
    suggestions.suggested_h1 = parsedSuggestions.suggested_h1 || suggestions.suggested_h1;
    suggestions.suggested_h2s = parsedSuggestions.suggested_h2s || suggestions.suggested_h2s;
    suggestions.suggested_h3s = parsedSuggestions.suggested_h3s || suggestions.suggested_h3s;
    suggestions.suggested_h4s = parsedSuggestions.suggested_h4s || suggestions.suggested_h4s;
    suggestions.title_context = parsedSuggestions.title_context || suggestions.title_context;
    suggestions.description_context = parsedSuggestions.description_context || suggestions.description_context;
    suggestions.h1_context = parsedSuggestions.h1_context || suggestions.h1_context;
    suggestions.h2s_context = parsedSuggestions.h2s_context || suggestions.h2s_context;
    suggestions.h3s_context = parsedSuggestions.h3s_context || suggestions.h3s_context;
    suggestions.h4s_context = parsedSuggestions.h4s_context || suggestions.h4s_context;

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erreur complète:', error);
    return new Response(
      JSON.stringify({
        error: `Erreur lors du traitement: ${error.message}`,
        details: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
