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

    console.log('Received data:', { currentTitle, currentDescription, currentH1, currentH2s, currentH3s, currentH4s });

    const prompt = `Tu es un expert SEO. Analyse et améliore le contenu suivant pour un meilleur référencement.
    
Contenu actuel :
- Titre: "${currentTitle}"
- Description: "${currentDescription}"
- H1: "${currentH1}"
- H2s: "${currentH2s?.join(', ')}"
- H3s: "${currentH3s?.join(', ')}"
- H4s: "${currentH4s?.join(', ')}"

Fournis UNIQUEMENT un objet JSON avec cette structure exacte, sans aucun texte avant ou après :
{
  "suggested_title": "nouveau titre optimisé",
  "suggested_description": "nouvelle description optimisée",
  "suggested_h1": "nouveau H1 optimisé",
  "suggested_h2s": ["nouveau H2 1", "nouveau H2 2"],
  "suggested_h3s": ["nouveau H3 1", "nouveau H3 2"],
  "suggested_h4s": ["nouveau H4 1", "nouveau H4 2"]
}

Les suggestions doivent :
- Inclure des mots-clés pertinents
- Être optimisées pour le SEO
- Garder un style naturel et engageant
- Respecter les bonnes pratiques SEO actuelles
- Être en français
- Avoir une longueur appropriée (titre < 60 caractères, description < 155 caractères)`;

    console.log('Sending prompt to OpenAI');

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
            content: 'Tu es un expert SEO qui génère des suggestions d\'optimisation. Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ou après.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log('OpenAI response:', data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    // Essayer de parser la réponse en JSON
    try {
      const suggestions = JSON.parse(data.choices[0].message.content.trim());
      console.log('Parsed suggestions:', suggestions);

      return new Response(JSON.stringify(suggestions), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error('Failed to parse OpenAI response as JSON');
    }
  } catch (error) {
    console.error('Error in generate-seo-suggestions function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'An error occurred while generating SEO suggestions' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});