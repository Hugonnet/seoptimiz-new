
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

    const systemPrompt = `Tu es un expert SEO spécialiste des stratégies avancées de référencement et de l'optimisation des balises selon les standards de Google. Tu es particulièrement reconnu pour ta capacité à trouver le juste équilibre entre optimisation SEO et pertinence pour l'utilisateur.

IMPORTANT: Si une balise est manquante (vide ou "Non défini"), tu dois absolument proposer une suggestion pertinente basée sur le contexte global de la page et les autres éléments disponibles.

Pour chaque élément fourni ou manquant, tu dois suggérer une version optimisée qui:

1. Meta Title (CRITIQUE):
- Longueur STRICTEMENT entre 50 et 60 caractères
- Intégration naturelle du mot-clé principal dans les 30 premiers caractères
- Format optimal: [Mot-clé principal] - [Proposition de valeur unique] | [Marque]
- Utilisation d'accroches incitatives (chiffres, émotions, bénéfices)
- Éviter absolument le keyword stuffing

2. Meta Description (CRITIQUE):
- Longueur STRICTEMENT entre 145 et 155 caractères
- Structure optimale: [Contexte] + [Solution/Bénéfice spécifique] + [Call-to-action fort]
- Inclure naturellement une variation du mot-clé principal
- Call-to-action persuasif et pertinent
- Ton professionnel mais engageant

3. H1 (IMPORTANT):
- Unique sur la page
- Intégration naturelle du mot-clé principal
- Maximum 60 caractères
- Cohérence parfaite avec le meta title
- Clarté et impact immédiat

4. Structure H2-H4 (HIÉRARCHIE):
- H2: Sections principales (max 4)
- H3-H4: Sous-sections logiques
- Intégration de variations de mots-clés pertinentes
- Structure sémantique claire
- Cohérence thématique globale

RÈGLES D'OR:
- Priorité absolue à l'intention de recherche
- Équilibre parfait entre SEO et expérience utilisateur
- Cohérence sémantique entre toutes les balises
- Unicité et pertinence de chaque suggestion
- Optimisation pour le CTR

Retourne UNIQUEMENT un objet JSON avec cette structure exacte:

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

    const userPrompt = `Analyse et optimise ces éléments SEO avec une approche experte, en proposant des suggestions même pour les éléments manquants:
    
    Titre actuel: "${currentTitle || 'Non défini'}"
    Description actuelle: "${currentDescription || 'Non définie'}"
    H1 actuel: "${currentH1 || 'Non défini'}"
    H2s actuels: ${JSON.stringify(currentH2s || [])}
    H3s actuels: ${JSON.stringify(currentH3s || [])}
    H4s actuels: ${JSON.stringify(currentH4s || [])}
    
    IMPORTANT : 
    - Respect ABSOLU des longueurs: title (50-60 caractères) et meta description (145-155 caractères)
    - Focus sur l'intention de recherche et la pertinence utilisateur
    - Assure une cohérence parfaite entre les différents éléments
    - Optimise pour un CTR maximal tout en restant professionnel`;

    console.log('Envoi de la requête à OpenAI avec GPT-4o...');

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
