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
    const { currentTitle, currentDescription, currentH1, currentH2s, currentH3s, currentH4s } = await req.json();
    
    console.log('Données reçues:', { currentTitle, currentDescription, currentH1, currentH2s, currentH3s, currentH4s });

    if (!openAIApiKey) {
      throw new Error('La clé API OpenAI n\'est pas configurée');
    }

    const systemPrompt = `Tu es un expert SEO spécialisé dans l'optimisation de contenu en français.
    Ta tâche est de générer des suggestions d'optimisation SEO pour chaque élément HTML fourni.
    Tu dois UNIQUEMENT répondre avec un objet JSON valide, sans aucun texte avant ou après, sans délimiteurs markdown.
    L'objet JSON doit contenir exactement ces propriétés :
    {
      "suggested_title": "suggestion pour le titre",
      "suggested_description": "suggestion pour la description",
      "suggested_h1": "suggestion pour le h1",
      "suggested_h2s": ["suggestion h2 1", "suggestion h2 2", ...],
      "suggested_h3s": ["suggestion h3 1", "suggestion h3 2", ...],
      "suggested_h4s": ["suggestion h4 1", "suggestion h4 2", ...],
      "title_context": "explication pour le titre",
      "description_context": "explication pour la description",
      "h1_context": "explication pour le h1",
      "h2s_context": ["explication h2 1", "explication h2 2", ...],
      "h3s_context": ["explication h3 1", "explication h3 2", ...],
      "h4s_context": ["explication h4 1", "explication h4 2", ...]
    }`;

    const userPrompt = `Analyse et optimise ces éléments SEO :
    
    Titre actuel: "${currentTitle || ''}"
    Description actuelle: "${currentDescription || ''}"
    H1 actuel: "${currentH1 || ''}"
    H2s actuels: ${JSON.stringify(currentH2s || [])}
    H3s actuels: ${JSON.stringify(currentH3s || [])}
    H4s actuels: ${JSON.stringify(currentH4s || [])}
    
    Génère des suggestions pertinentes pour chaque élément en français.
    Réponds UNIQUEMENT avec l'objet JSON demandé, sans aucun texte avant ou après.`;

    console.log('Envoi de la requête à OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
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
    console.log('Réponse OpenAI brute:', data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Réponse OpenAI invalide ou vide');
    }

    // Nettoyer la réponse de tout délimiteur markdown potentiel
    let cleanedContent = data.choices[0].message.content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    console.log('Contenu nettoyé:', cleanedContent);

    // Parser la réponse JSON
    const suggestions = JSON.parse(cleanedContent);
    console.log('Suggestions parsées:', suggestions);

    // Vérifier que toutes les propriétés requises sont présentes
    const requiredProps = [
      'suggested_title',
      'suggested_description',
      'suggested_h1',
      'suggested_h2s',
      'suggested_h3s',
      'suggested_h4s',
      'title_context',
      'description_context',
      'h1_context',
      'h2s_context',
      'h3s_context',
      'h4s_context'
    ];

    for (const prop of requiredProps) {
      if (!(prop in suggestions)) {
        throw new Error(`Propriété manquante dans la réponse: ${prop}`);
      }
    }

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erreur dans la fonction generate-seo-suggestions:', error);
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