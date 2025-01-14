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

    const systemPrompt = `Tu es un expert SEO spécialisé dans l'optimisation de contenu en français.
    Ta tâche est de générer des suggestions d'optimisation SEO pour chaque élément HTML fourni.

    RÈGLES STRICTES:
    1. Toutes les suggestions doivent être en français
    2. Chaque suggestion doit être unique et spécifique au contenu
    3. Les suggestions doivent respecter la hiérarchie des titres
    4. Éviter les suggestions génériques
    5. Maintenir le même nombre de suggestions que d'éléments originaux
    6. Chaque suggestion doit être accompagnée d'une explication pertinente
    7. Format JSON strict requis pour la réponse

    FORMAT DE RÉPONSE REQUIS:
    {
      "suggested_title": "string",
      "title_context": "string",
      "suggested_description": "string",
      "description_context": "string",
      "suggested_h1": "string",
      "h1_context": "string",
      "suggested_h2s": ["string"],
      "h2s_context": ["string"],
      "suggested_h3s": ["string"],
      "h3s_context": ["string"],
      "suggested_h4s": ["string"],
      "h4s_context": ["string"]
    }`;

    const userPrompt = `Analyse et optimise les éléments SEO suivants:

    TITRE ACTUEL: "${currentTitle || 'Non défini'}"
    DESCRIPTION ACTUELLE: "${currentDescription || 'Non définie'}"
    H1 ACTUEL: "${currentH1 || 'Non défini'}"
    H2s ACTUELS: ${JSON.stringify(currentH2s || [])}
    H3s ACTUELS: ${JSON.stringify(currentH3s || [])}
    H4s ACTUELS: ${JSON.stringify(currentH4s || [])}

    IMPORTANT:
    - Fournis une suggestion pour CHAQUE élément existant
    - Les suggestions doivent être pertinentes et spécifiques
    - Inclus une explication claire pour chaque suggestion
    - Respecte STRICTEMENT le format JSON demandé`;

    console.log('Envoi à OpenAI - System Prompt:', systemPrompt);
    console.log('Envoi à OpenAI - User Prompt:', userPrompt);

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.5, // Réduit pour plus de cohérence
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('Erreur OpenAI:', errorText);
      throw new Error(`Erreur OpenAI: ${errorText}`);
    }

    const openAIData = await openAIResponse.json();
    console.log('Réponse OpenAI brute:', openAIData);

    if (!openAIData.choices?.[0]?.message?.content) {
      throw new Error('Réponse OpenAI invalide ou vide');
    }

    const content = openAIData.choices[0].message.content.trim();
    console.log('Contenu à parser:', content);

    try {
      const suggestions = JSON.parse(content);
      
      // Validation approfondie de la structure
      const requiredKeys = [
        'suggested_title', 'title_context',
        'suggested_description', 'description_context',
        'suggested_h1', 'h1_context',
        'suggested_h2s', 'h2s_context',
        'suggested_h3s', 'h3s_context',
        'suggested_h4s', 'h4s_context'
      ];

      for (const key of requiredKeys) {
        if (!(key in suggestions)) {
          console.error(`Clé manquante: ${key}`);
          throw new Error(`Structure JSON invalide: clé manquante "${key}"`);
        }
      }

      // Validation des tableaux
      const validateArray = (current: string[] | null | undefined, suggested: string[], context: string[], name: string) => {
        if (!Array.isArray(suggested) || !Array.isArray(context)) {
          throw new Error(`Les suggestions ou le contexte pour ${name} ne sont pas des tableaux`);
        }
        if (current && (suggested.length !== current.length || context.length !== current.length)) {
          throw new Error(`Nombre incorrect de suggestions/contextes pour ${name}`);
        }
      };

      validateArray(currentH2s, suggestions.suggested_h2s, suggestions.h2s_context, 'H2');
      validateArray(currentH3s, suggestions.suggested_h3s, suggestions.h3s_context, 'H3');
      validateArray(currentH4s, suggestions.suggested_h4s, suggestions.h4s_context, 'H4');

      console.log('Suggestions validées:', suggestions);

      return new Response(JSON.stringify(suggestions), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Erreur de parsing ou validation:', error);
      throw new Error(`Impossible de parser ou valider la réponse: ${error.message}`);
    }
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