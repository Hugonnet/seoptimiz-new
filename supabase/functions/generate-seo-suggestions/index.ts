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

    const systemPrompt = `Tu es un expert SEO francophone spécialisé dans l'optimisation de contenu web.
    Ta mission est de générer des suggestions d'optimisation SEO pertinentes et détaillées.

    RÈGLES IMPORTANTES:
    1. Pour la meta description:
       - EXACTEMENT entre 145 et 155 caractères
       - Inclure un appel à l'action clair
       - Utiliser des mots-clés naturellement
       - Être persuasive et informative

    2. Pour le titre:
       - Entre 50 et 60 caractères
       - Placer les mots-clés importants au début
       - Inclure le nom de l'entreprise
       - Être accrocheur tout en restant professionnel

    3. Pour les balises H1:
       - Une seule balise H1 par page
       - Inclure le mot-clé principal
       - Être cohérent avec le titre
       - Être clair et descriptif

    4. Pour chaque suggestion:
       - Fournir une explication SEO détaillée et technique
       - Expliquer pourquoi la modification améliore le référencement
       - Mentionner l'impact sur l'intention de recherche
       - Inclure des conseils d'optimisation spécifiques

    Réponds UNIQUEMENT avec un objet JSON valide contenant ces propriétés:
    {
      "suggested_title": "string (50-60 caractères)",
      "suggested_description": "string (EXACTEMENT 145-155 caractères)",
      "suggested_h1": "string",
      "suggested_h2s": ["string"],
      "suggested_h3s": ["string"],
      "suggested_h4s": ["string"],
      "title_context": "string (explication technique SEO)",
      "description_context": "string (explication technique SEO)",
      "h1_context": "string (explication technique SEO)",
      "h2s_context": ["string"],
      "h3s_context": ["string"],
      "h4s_context": ["string"]
    }`;

    const userPrompt = `Analyse et optimise ces éléments SEO en suivant les règles strictes:
    
    Titre actuel: "${currentTitle || ''}"
    Description actuelle: "${currentDescription || ''}"
    H1 actuel: "${currentH1 || ''}"
    H2s actuels: ${JSON.stringify(currentH2s || [])}
    H3s actuels: ${JSON.stringify(currentH3s || [])}
    H4s actuels: ${JSON.stringify(currentH4s || [])}
    
    Pour chaque élément:
    1. Analyse l'existant d'un point de vue SEO
    2. Propose une version optimisée
    3. Explique techniquement pourquoi c'est mieux
    4. Fournis des métriques SEO spécifiques`;

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

    let cleanedContent = data.choices[0].message.content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    console.log('Contenu nettoyé:', cleanedContent);

    const suggestions = JSON.parse(cleanedContent);
    console.log('Suggestions parsées:', suggestions);

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

    // Vérification de la longueur de la meta description
    const descriptionLength = suggestions.suggested_description.length;
    if (descriptionLength < 145 || descriptionLength > 155) {
      console.warn(`La meta description fait ${descriptionLength} caractères, ajustement nécessaire`);
      // On pourrait ajouter ici une logique d'ajustement automatique
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