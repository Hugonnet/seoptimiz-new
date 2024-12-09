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
    const { currentTitle, currentDescription, currentH1, currentH2s, currentH3s, currentH4s, visibleText } = await req.json();

    console.log('Données reçues pour analyse:', { currentTitle, currentDescription, currentH1, currentH2s, currentH3s, currentH4s, visibleText });

    const prompt = `Tu es un expert SEO de renommée internationale avec plus de 15 ans d'expérience dans l'optimisation des sites web pour les moteurs de recherche. Analyse en profondeur le contenu suivant et fournis des recommandations détaillées pour améliorer le référencement.

Contenu actuel à analyser :
- Titre: "${currentTitle}"
- Description: "${currentDescription}"
- H1: "${currentH1}"
- H2s: "${currentH2s?.join(', ')}"
- H3s: "${currentH3s?.join(', ')}"
- H4s: "${currentH4s?.join(', ')}"
- Texte visible: "${visibleText?.join(' ')}"

Pour CHAQUE élément, tu dois :
1. Analyser sa pertinence SEO
2. Vérifier sa longueur optimale (titre < 60 caractères, description < 155 caractères)
3. Évaluer la présence et le placement des mots-clés
4. Suggérer des améliorations concrètes
5. Fournir un contexte explicatif pour chaque suggestion

Fournis UNIQUEMENT un objet JSON avec cette structure exacte, sans texte avant ou après :
{
  "suggested_title": "nouveau titre optimisé",
  "title_context": "explication détaillée de l'amélioration proposée",
  "suggested_description": "nouvelle description optimisée",
  "description_context": "explication détaillée de l'amélioration proposée",
  "suggested_h1": "nouveau H1 optimisé",
  "h1_context": "explication détaillée de l'amélioration proposée",
  "suggested_h2s": ["nouveau H2 1", "nouveau H2 2"],
  "h2s_context": ["explication pour H2 1", "explication pour H2 2"],
  "suggested_h3s": ["nouveau H3 1", "nouveau H3 2"],
  "h3s_context": ["explication pour H3 1", "explication pour H3 2"],
  "suggested_h4s": ["nouveau H4 1", "nouveau H4 2"],
  "h4s_context": ["explication pour H4 1", "explication pour H4 2"],
  "suggested_visible_text": ["texte optimisé 1", "texte optimisé 2"],
  "visible_text_context": ["explication pour texte 1", "explication pour texte 2"]
}

Les suggestions doivent :
- Être basées sur les meilleures pratiques SEO 2024
- Inclure des mots-clés pertinents et leur placement stratégique
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
            content: 'Tu es un expert SEO reconnu internationalement qui fournit des analyses approfondies et des recommandations concrètes.' 
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