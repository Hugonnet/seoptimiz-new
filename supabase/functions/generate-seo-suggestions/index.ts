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

    console.log('Données reçues pour analyse:', { currentTitle, currentDescription, currentH1, currentH2s, currentH3s, currentH4s });

    const prompt = `En tant qu'expert SEO, analyse et optimise chaque balise de titre et description pour maximiser leur impact SEO. 
    Voici le contenu actuel du site :

    Titre : "${currentTitle}"
    Description : "${currentDescription}"
    H1 : "${currentH1}"
    H2s : ${JSON.stringify(currentH2s)}
    H3s : ${JSON.stringify(currentH3s)}
    H4s : ${JSON.stringify(currentH4s)}

    Pour chaque élément :
    1. Optimise le contenu pour un meilleur référencement
    2. Assure-toi que les mots-clés principaux sont bien placés
    3. Vérifie la longueur optimale (titre < 60 caractères, description < 155 caractères)
    4. Maintiens une hiérarchie logique entre les titres
    5. Ajoute des mots-clés pertinents tout en gardant un style naturel
    6. Fournis une explication détaillée pour chaque suggestion

    Retourne un objet JSON avec cette structure exacte :
    {
      "suggested_title": "nouveau titre optimisé",
      "title_context": "explication de l'amélioration",
      "suggested_description": "nouvelle description optimisée",
      "description_context": "explication de l'amélioration",
      "suggested_h1": "nouveau H1 optimisé",
      "h1_context": "explication de l'amélioration",
      "suggested_h2s": ["nouveau H2 1", "nouveau H2 2"],
      "h2s_context": ["explication pour H2 1", "explication pour H2 2"],
      "suggested_h3s": ["nouveau H3 1", "nouveau H3 2"],
      "h3s_context": ["explication pour H3 1", "explication pour H3 2"],
      "suggested_h4s": ["nouveau H4 1", "nouveau H4 2"],
      "h4s_context": ["explication pour H4 1", "explication pour H4 2"]
    }

    Les suggestions doivent :
    - Être basées sur les meilleures pratiques SEO 2024
    - Inclure des mots-clés pertinents
    - Maintenir un style naturel et engageant
    - Respecter les contraintes de longueur
    - Être en français
    - Être concrètes et applicables immédiatement`;

    console.log('Envoi du prompt à OpenAI');

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
            content: 'Tu es un expert SEO spécialisé dans l\'optimisation des balises meta et de la structure des titres.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log('Réponse OpenAI:', data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Réponse invalide de OpenAI');
    }

    try {
      const suggestions = JSON.parse(data.choices[0].message.content.trim());
      console.log('Suggestions analysées:', suggestions);

      return new Response(JSON.stringify(suggestions), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Erreur lors du parsing de la réponse OpenAI:', parseError);
      throw new Error('Impossible de parser la réponse OpenAI en JSON');
    }
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