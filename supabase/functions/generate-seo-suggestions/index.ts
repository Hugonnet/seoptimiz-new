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
    TRÈS IMPORTANT: Ta réponse doit être un objet JSON valide SANS formatage markdown (pas de \`\`\`json ou autre balise).

    RÈGLES STRICTES:
    1. Toutes les suggestions doivent être en français
    2. Chaque suggestion doit être unique et spécifique au contenu
    3. Les suggestions doivent respecter la hiérarchie des titres
    4. Éviter les suggestions génériques
    5. Pour chaque élément (H2s, H3s, H4s), fournir EXACTEMENT le même nombre de suggestions que d'éléments originaux
    6. Si un élément est vide ou absent, retourner un tableau vide pour cet élément
    7. Chaque suggestion doit être accompagnée d'une explication pertinente
    8. Retourner UNIQUEMENT un objet JSON valide sans aucun formatage markdown`;

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
    - Pour les tableaux (H2s, H3s, H4s), le nombre de suggestions doit correspondre EXACTEMENT au nombre d'éléments originaux
    - Si un tableau est vide, retourne un tableau vide
    - Retourne UNIQUEMENT un objet JSON valide sans aucun formatage markdown`;

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
        temperature: 0.3,
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
      
      // Ensure arrays are initialized properly
      suggestions.suggested_h2s = Array.isArray(currentH2s) ? new Array(currentH2s.length).fill('') : [];
      suggestions.h2s_context = Array.isArray(currentH2s) ? new Array(currentH2s.length).fill('') : [];
      suggestions.suggested_h3s = Array.isArray(currentH3s) ? new Array(currentH3s.length).fill('') : [];
      suggestions.h3s_context = Array.isArray(currentH3s) ? new Array(currentH3s.length).fill('') : [];
      suggestions.suggested_h4s = Array.isArray(currentH4s) ? new Array(currentH4s.length).fill('') : [];
      suggestions.h4s_context = Array.isArray(currentH4s) ? new Array(currentH4s.length).fill('') : [];

      // Copy over the OpenAI suggestions while maintaining array lengths
      const openAISuggestions = JSON.parse(cleanContent);
      if (Array.isArray(openAISuggestions.suggested_h2s)) {
        suggestions.suggested_h2s = openAISuggestions.suggested_h2s.slice(0, currentH2s?.length || 0);
        suggestions.h2s_context = openAISuggestions.h2s_context?.slice(0, currentH2s?.length || 0) || [];
      }
      if (Array.isArray(openAISuggestions.suggested_h3s)) {
        suggestions.suggested_h3s = openAISuggestions.suggested_h3s.slice(0, currentH3s?.length || 0);
        suggestions.h3s_context = openAISuggestions.h3s_context?.slice(0, currentH3s?.length || 0) || [];
      }
      if (Array.isArray(openAISuggestions.suggested_h4s)) {
        suggestions.suggested_h4s = openAISuggestions.suggested_h4s.slice(0, currentH4s?.length || 0);
        suggestions.h4s_context = openAISuggestions.h4s_context?.slice(0, currentH4s?.length || 0) || [];
      }

      // Copy non-array suggestions
      suggestions.suggested_title = openAISuggestions.suggested_title || '';
      suggestions.title_context = openAISuggestions.title_context || '';
      suggestions.suggested_description = openAISuggestions.suggested_description || '';
      suggestions.description_context = openAISuggestions.description_context || '';
      suggestions.suggested_h1 = openAISuggestions.suggested_h1 || '';
      suggestions.h1_context = openAISuggestions.h1_context || '';

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