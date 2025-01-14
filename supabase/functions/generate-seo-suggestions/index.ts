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
    TRÈS IMPORTANT: Ta réponse doit être un objet JSON valide SANS formatage markdown.

    RÈGLES STRICTES:
    1. Toutes les suggestions doivent être en français et pertinentes
    2. Chaque suggestion doit être unique et spécifique au contenu
    3. Les suggestions doivent respecter la hiérarchie des titres
    4. Pour chaque élément (title, description, h1), TOUJOURS fournir une suggestion même si l'élément original est bon
    5. Pour les tableaux (h2s, h3s, h4s), fournir EXACTEMENT le même nombre de suggestions que d'éléments originaux
    6. Si un tableau est vide, retourner un tableau vide
    7. Chaque suggestion doit avoir une explication claire et détaillée
    8. Ne jamais retourner "Non défini" comme suggestion`;

    const userPrompt = `Analyse et optimise les éléments SEO suivants:

    TITRE ACTUEL: "${currentTitle || ''}"
    DESCRIPTION ACTUELLE: "${currentDescription || ''}"
    H1 ACTUEL: "${currentH1 || ''}"
    H2s ACTUELS: ${JSON.stringify(currentH2s || [])}
    H3s ACTUELS: ${JSON.stringify(currentH3s || [])}
    H4s ACTUELS: ${JSON.stringify(currentH4s || [])}

    IMPORTANT:
    - Fournis une suggestion pour CHAQUE élément, même si l'original est déjà bon
    - Les suggestions doivent être spécifiques et pertinentes
    - Inclus une explication détaillée pour chaque suggestion
    - Pour les tableaux (H2s, H3s, H4s), le nombre de suggestions doit correspondre EXACTEMENT au nombre d'éléments originaux
    - Si un tableau est vide, retourne un tableau vide
    - Ne jamais retourner "Non défini" comme suggestion`;

    console.log('Envoi à OpenAI - System Prompt:', systemPrompt);
    console.log('Envoi à OpenAI - User Prompt:', userPrompt);

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
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
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      console.log('Contenu nettoyé:', cleanContent);
      
      const suggestions = JSON.parse(cleanContent);
      
      // Ensure we have valid suggestions for all elements
      const validatedSuggestions = {
        suggested_title: suggestions.suggested_title || "Optimisation du titre en cours...",
        title_context: suggestions.title_context || "Analyse en cours...",
        suggested_description: suggestions.suggested_description || "Optimisation de la description en cours...",
        description_context: suggestions.description_context || "Analyse en cours...",
        suggested_h1: suggestions.suggested_h1 || "Optimisation du H1 en cours...",
        h1_context: suggestions.h1_context || "Analyse en cours...",
        suggested_h2s: Array.isArray(currentH2s) ? suggestions.suggested_h2s?.slice(0, currentH2s.length) || [] : [],
        h2s_context: Array.isArray(currentH2s) ? suggestions.h2s_context?.slice(0, currentH2s.length) || [] : [],
        suggested_h3s: Array.isArray(currentH3s) ? suggestions.suggested_h3s?.slice(0, currentH3s.length) || [] : [],
        h3s_context: Array.isArray(currentH3s) ? suggestions.h3s_context?.slice(0, currentH3s.length) || [] : [],
        suggested_h4s: Array.isArray(currentH4s) ? suggestions.suggested_h4s?.slice(0, currentH4s.length) || [] : [],
        h4s_context: Array.isArray(currentH4s) ? suggestions.h4s_context?.slice(0, currentH4s.length) || [] : []
      };

      // Validate array lengths match
      if (Array.isArray(currentH2s) && validatedSuggestions.suggested_h2s.length !== currentH2s.length) {
        validatedSuggestions.suggested_h2s = currentH2s.map(() => "Optimisation en cours...");
        validatedSuggestions.h2s_context = currentH2s.map(() => "Analyse en cours...");
      }

      if (Array.isArray(currentH3s) && validatedSuggestions.suggested_h3s.length !== currentH3s.length) {
        validatedSuggestions.suggested_h3s = currentH3s.map(() => "Optimisation en cours...");
        validatedSuggestions.h3s_context = currentH3s.map(() => "Analyse en cours...");
      }

      if (Array.isArray(currentH4s) && validatedSuggestions.suggested_h4s.length !== currentH4s.length) {
        validatedSuggestions.suggested_h4s = currentH4s.map(() => "Optimisation en cours...");
        validatedSuggestions.h4s_context = currentH4s.map(() => "Analyse en cours...");
      }

      console.log('Suggestions validées:', validatedSuggestions);

      return new Response(JSON.stringify(validatedSuggestions), {
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