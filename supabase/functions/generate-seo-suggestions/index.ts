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

    const systemPrompt = `Tu es un expert SEO qui optimise le contenu web.
    Retourne UNIQUEMENT un objet JSON avec cette structure exacte, sans commentaires ni texte additionnel:

    {
      "suggested_title": "string (50-60 caractères)",
      "suggested_description": "string (145-155 caractères)",
      "suggested_h1": "string",
      "suggested_h2s": ["array of strings"],
      "suggested_h3s": ["array of strings"],
      "suggested_h4s": ["array of strings"],
      "title_context": "string",
      "description_context": "string",
      "h1_context": "string",
      "h2s_context": ["array of strings"],
      "h3s_context": ["array of strings"],
      "h4s_context": ["array of strings"]
    }`;

    const userPrompt = `Optimise ces éléments SEO:
    
    Titre: "${currentTitle || ''}"
    Description: "${currentDescription || ''}"
    H1: "${currentH1 || ''}"
    H2s: ${JSON.stringify(currentH2s || [])}
    H3s: ${JSON.stringify(currentH3s || [])}
    H4s: ${JSON.stringify(currentH4s || [])}`;

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
        temperature: 0.3,
        response_format: { type: "json_object" }
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

    const suggestions = JSON.parse(data.choices[0].message.content);
    console.log('Suggestions parsées:', suggestions);

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