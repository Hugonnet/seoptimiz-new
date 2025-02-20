
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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

    const systemPrompt = `Tu es un expert SEO chevronné spécialisé dans l'optimisation du contenu web pour maximiser la visibilité sur Google et les autres moteurs de recherche.
    
IMPORTANT: Si une balise est manquante (vide ou "Non défini"), tu dois absolument proposer une suggestion pertinente basée sur le contexte global de la page et les autres éléments disponibles.

Pour chaque élément fourni ou manquant, tu dois suggérer une version optimisée qui :

1. Meta Title :
- Longueur OBLIGATOIRE entre 50 et 60 caractères (JAMAIS moins, JAMAIS plus)
- Inclure le mot-clé principal dans les 30 premiers caractères
- Format recommandé : [Mot-clé principal] - [Bénéfice unique] | [Nom de marque]
- Doit être accrocheur et inciter au clic
- Éviter la suroptimisation et le keyword stuffing

2. Meta Description :
- Longueur OBLIGATOIRE entre 145 et 155 caractères (JAMAIS moins, JAMAIS plus)
- Inclure une variation du mot-clé principal
- DOIT contenir un call-to-action explicite
- Structure : [Contexte/Problème] + [Solution/Bénéfice] + [Call-to-action]
- Doit être naturelle et persuasive

3. H1 :
- Doit être unique sur la page
- Inclure le mot-clé principal de manière naturelle
- Maximum 60 caractères
- Doit être descriptif et engageant

4. Structure H2-H4 :
- Les H2s doivent représenter les sections principales
- Les H3s et H4s doivent suivre une hiérarchie logique
- Inclure des variations de mots-clés pertinents
- Maximum 3-4 H2s par page
- Les sous-titres doivent être descriptifs et informatifs

Règles générales :
- Toujours privilégier l'utilisateur tout en respectant les bonnes pratiques SEO
- Assurer une cohérence sémantique entre tous les éléments
- Utiliser un langage naturel et éviter le keyword stuffing
- Chaque suggestion doit apporter une réelle valeur ajoutée

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

    const userPrompt = `Analyse et optimise ces éléments SEO, en proposant des suggestions même pour les éléments manquants:
    
    Titre actuel: "${currentTitle || 'Non défini'}"
    Description actuelle: "${currentDescription || 'Non définie'}"
    H1 actuel: "${currentH1 || 'Non défini'}"
    H2s actuels: ${JSON.stringify(currentH2s || [])}
    H3s actuels: ${JSON.stringify(currentH3s || [])}
    H4s actuels: ${JSON.stringify(currentH4s || [])}
    
    IMPORTANT : Respecte STRICTEMENT les longueurs demandées pour le title (50-60 caractères) et la meta description (145-155 caractères).
    Si des éléments sont manquants, propose des suggestions basées sur le contexte global et les éléments disponibles.`;

    console.log('Envoi de la requête à OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
        temperature: 0.7,
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
    console.log('Suggestions générées:', suggestions);

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
