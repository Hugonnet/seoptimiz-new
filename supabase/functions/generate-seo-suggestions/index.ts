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

    const prompt = `En tant qu'expert SEO, analyse et améliore le contenu suivant pour un meilleur référencement:

Title actuel: ${currentTitle}
Description actuelle: ${currentDescription}
H1 actuel: ${currentH1}
H2s actuels: ${currentH2s?.join(', ')}
H3s actuels: ${currentH3s?.join(', ')}
H4s actuels: ${currentH4s?.join(', ')}

Génère des suggestions d'amélioration en format JSON avec cette structure exacte:
{
  "suggested_title": "...",
  "suggested_description": "...",
  "suggested_h1": "...",
  "suggested_h2s": ["..."],
  "suggested_h3s": ["..."],
  "suggested_h4s": ["..."]
}

Les suggestions doivent:
- Inclure des mots-clés pertinents
- Être optimisées pour le SEO
- Garder un style naturel et engageant
- Respecter les bonnes pratiques SEO actuelles`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Tu es un expert SEO qui génère des suggestions d\'optimisation.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const data = await response.json();
    const suggestions = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erreur:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});