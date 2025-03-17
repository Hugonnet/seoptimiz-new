
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
    const { 
      currentTitle, 
      currentDescription, 
      currentH1, 
      currentH2s, 
      currentH3s, 
      currentH4s,
      isProtectedPage 
    } = await req.json();
    
    console.log('Données reçues:', { currentTitle, currentDescription, currentH1, currentH2s, currentH3s, currentH4s, isProtectedPage });

    if (!openAIApiKey) {
      throw new Error('La clé API OpenAI n\'est pas configurée');
    }

    // If bot protection was detected, adjust the prompt to inform the AI
    let botWarningPrompt = "";
    if (isProtectedPage) {
      botWarningPrompt = `
IMPORTANT: Les données analysées proviennent d'une page de protection anti-bot et NON du contenu réel du site. Ton analyse doit mettre l'accent sur ce fait.
- Commence chaque explication par un avertissement clair indiquant que les recommandations sont basées sur une page de protection anti-bot.
- Suggère des améliorations génériques mais précise qu'elles ne peuvent pas être optimisées pour le contenu réel du site.
- Recommande à l'utilisateur d'essayer une autre méthode d'accès au site pour obtenir de vraies données.
`;
    }

    const systemPrompt = `Tu es un expert SEO spécialiste des stratégies avancées de référencement et de l'optimisation des balises selon les standards de Google. Pour chaque suggestion, tu dois fournir une explication détaillée et pédagogique des améliorations proposées.

${botWarningPrompt}

IMPORTANT: 
- Si la meta description est absente (vide ou "Non définie"), tu DOIS en générer une nouvelle en te basant sur :
  1. Le titre de la page
  2. Le contenu H1
  3. La structure des headings disponibles
  4. Le contexte général de la page
- La description générée doit respecter STRICTEMENT les critères de longueur et de qualité

Pour chaque élément fourni ou manquant, tu dois suggérer une version optimisée qui:

1. Meta Title (CRITIQUE):
- Longueur STRICTEMENT entre 50 et 60 caractères
- Intégration naturelle du mot-clé principal dans les 30 premiers caractères
- Format optimal: [Mot-clé principal] - [Proposition de valeur unique] | [Marque]
- Utilisation d'accroches incitatives (chiffres, émotions, bénéfices)
- Éviter absolument le keyword stuffing

2. Meta Description (CRITIQUE et OBLIGATOIRE):
- TOUJOURS fournir une suggestion, même si la description actuelle est absente
- Longueur STRICTEMENT entre 155 et 160 caractères
- Structure optimale: [Contexte] + [Solution/Bénéfice spécifique] + [Call-to-action fort]
- Développer suffisamment le contenu pour atteindre les 155-160 caractères
- Inclure naturellement une variation du mot-clé principal
- Call-to-action persuasif et pertinent
- Ton professionnel mais engageant
- Message complet et informatif qui incite au clic
- Si la description originale est absente, créer une nouvelle description basée sur le titre et le H1

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

Pour chaque suggestion, fournis une explication détaillée qui inclut:
1. Les points forts de la version actuelle (ou "Description manquante" si absente)
2. Les opportunités d'amélioration identifiées
3. Comment la suggestion optimise le SEO et l'expérience utilisateur
4. Les mots-clés et variations ciblés
5. L'impact attendu sur le CTR et le positionnement

RÈGLES D'OR pour les explications:
- Être pédagogique et constructif
- Justifier chaque modification proposée
- Mettre en évidence la valeur ajoutée
- Expliquer l'impact SEO attendu
- Fournir des conseils concrets d'implémentation

Retourne un objet JSON avec cette structure exacte:

{
  "suggested_title": "string (50-60 caractères)",
  "suggested_description": "string (155-160 caractères)",
  "suggested_h1": "string",
  "suggested_h2s": ["array of strings"],
  "suggested_h3s": ["array of strings"],
  "suggested_h4s": ["array of strings"],
  "title_context": "string",
  "description_context": "string (DOIT inclure une explication même si la description originale est absente)",
  "h1_context": "string",
  "h2s_context": ["array of strings"],
  "h3s_context": ["array of strings"],
  "h4s_context": ["array of strings"]
}`;

    let userPrompt = `Analyse et optimise ces éléments SEO avec une approche experte, en proposant des suggestions même pour les éléments manquants:
    
    Titre actuel: "${currentTitle || 'Non défini'}"
    Description actuelle: "${currentDescription || 'Non définie - Une nouvelle description sera générée'}"
    H1 actuel: "${currentH1 || 'Non défini'}"
    H2s actuels: ${JSON.stringify(currentH2s || [])}
    H3s actuels: ${JSON.stringify(currentH3s || [])}
    H4s actuels: ${JSON.stringify(currentH4s || [])}
    `;
    
    // Add bot protection warning to user prompt if needed
    if (isProtectedPage) {
      userPrompt += `
    ATTENTION: Ces données proviennent d'une page de protection anti-bot, et non du contenu réel du site.
    Chaque suggestion doit commencer par avertir l'utilisateur de cette limitation.
    `;
    }
    
    userPrompt += `    
    IMPORTANT : 
    - Si la meta description est absente, tu DOIS en générer une nouvelle
    - Respect ABSOLU des longueurs: title (50-60 caractères) et meta description (155-160 caractères)
    - Développe des meta descriptions complètes et informatives
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
