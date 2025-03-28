
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

    const systemPrompt = `Tu es un expert SEO chevronné spécialisé dans l'optimisation du contenu web pour maximiser la visibilité sur les moteurs de recherche.
    
    IMPORTANT: Si une balise est manquante (vide ou "Non défini"), tu dois absolument proposer une suggestion pertinente basée sur le contexte global de la page et les autres éléments disponibles.
    
    Pour chaque élément fourni ou manquant, tu dois suggérer une version optimisée qui:
    - Correspond à sa position dans la hiérarchie
    - Utilise des mots-clés pertinents
    - Est naturelle et engageante pour les utilisateurs
    - Respecte les bonnes pratiques SEO
    
    RÈGLE FONDAMENTALE: Le title et le h1 NE DOIVENT JAMAIS être identiques. Ils doivent différer tout en restant cohérents et en ciblant les mêmes mots-clés principaux. Si tes propositions initiales sont identiques, tu DOIS reformuler l'un des deux pour créer une variante distincte.
    
    Règles spécifiques:
    - Title: 50-60 caractères, mots-clés au début
    - Description: 145-155 caractères, call-to-action clair
    - H1: Unique, inclut le mot-clé principal, et TOUJOURS différent du title
    - H2s, H3s, H4s: Structure logique et hiérarchique
    
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
    
    Si des éléments sont manquants, propose des suggestions basées sur le contexte global et les éléments disponibles.
    RAPPEL IMPORTANT: Assure-toi que tes suggestions pour le title et le h1 soient TOUJOURS différentes l'une de l'autre.`;

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

    // Vérification supplémentaire pour s'assurer que title et h1 sont différents
    if (suggestions.suggested_title === suggestions.suggested_h1) {
      console.log('Détection de title et h1 identiques, modification du h1...');
      // Modifier le h1 pour le rendre différent
      const baseH1 = suggestions.suggested_h1;
      suggestions.suggested_h1 = await generateAlternativeHeading(baseH1, currentH1, openAIApiKey);
      suggestions.h1_context += " (Reformulé pour différencier du title)";
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

// Fonction auxiliaire pour générer une version alternative d'un heading
async function generateAlternativeHeading(heading: string, currentHeading: string | null, apiKey: string): Promise<string> {
  try {
    const promptText = `Réécris ce titre H1 "${heading}" pour qu'il soit différent mais conserve le même sens et les mêmes mots-clés. Il doit être attractif, informatif, et optimisé pour le SEO. Assure-toi qu'il soit suffisamment différent du titre meta (title) tout en conservant sa force sémantique. Pour référence, le H1 actuel est: "${currentHeading || 'Non défini'}". Réponds uniquement avec le nouveau H1, sans commentaires ni explications.`;
    
    const altResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'Tu es un expert SEO qui optimise les titres H1. Réponds uniquement avec le texte optimisé, sans explications ni commentaires.' },
          { role: 'user', content: promptText }
        ],
        temperature: 0.7,
        max_tokens: 100
      }),
    });

    if (!altResponse.ok) {
      console.error('Erreur lors de la génération alternative:', await altResponse.text());
      // Fallback simple si l'API échoue
      return `${heading} - Votre solution optimale`;
    }

    const altData = await altResponse.json();
    const altHeading = altData.choices?.[0]?.message?.content?.trim();
    
    if (!altHeading) {
      return `${heading} - En savoir plus`;
    }
    
    return altHeading;
  } catch (error) {
    console.error('Erreur lors de la génération du h1 alternatif:', error);
    // Fallback en cas d'erreur
    return `${heading} - Découvrez nos services`;
  }
}
