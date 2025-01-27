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
    Ta mission est d'analyser et d'optimiser la structure SEO d'une page web en respectant ces règles strictes :

    RÈGLES CRITIQUES:
    1. Meta Title:
       - Entre 50-60 caractères EXACTEMENT
       - Mots-clés principaux en début de titre
       - Format: [Mot-clé Principal] - [Bénéfice Secondaire] | [Nom de l'entreprise]
       - Doit être accrocheur et pertinent

    2. Meta Description:
       - Entre 145-155 caractères EXACTEMENT
       - Structure: [Problème/Besoin] + [Solution unique] + [Call-to-action]
       - Inclure naturellement les mots-clés principaux
       - Doit donner envie de cliquer

    3. H1:
       - Un seul H1 par page
       - Inclure le mot-clé principal
       - Cohérent avec le titre mais pas identique
       - Maximum 60 caractères

    4. Structure H2-H4:
       - H2: Grands thèmes et sections principales (3-5 maximum)
       - H3: Sous-sections détaillées des H2 (2-4 par H2)
       - H4: Points spécifiques et questions fréquentes (2-3 par H3)
       - Chaque niveau doit être cohérent avec son parent
       - Utiliser des mots-clés secondaires naturellement

    5. Pour chaque suggestion:
       - Expliquer PRÉCISÉMENT pourquoi c'est mieux pour le SEO
       - Mentionner l'impact sur l'intention de recherche
       - Citer des métriques SEO spécifiques quand pertinent

    IMPORTANT: Garde une cohérence parfaite entre tous les niveaux de titres. Chaque suggestion doit avoir un lien logique avec sa section parente.`;

    const userPrompt = `Analyse et optimise ces éléments SEO en suivant les règles strictes.
    
    URL analysée: ${currentTitle ? 'Page existante' : 'Nouvelle page'}
    
    Titre actuel: "${currentTitle || ''}"
    Description actuelle: "${currentDescription || ''}"
    H1 actuel: "${currentH1 || ''}"
    H2s actuels: ${JSON.stringify(currentH2s || [])}
    H3s actuels: ${JSON.stringify(currentH3s || [])}
    H4s actuels: ${JSON.stringify(currentH4s || [])}
    
    Pour chaque élément:
    1. Analyse critique de l'existant
    2. Proposition d'optimisation avec justification SEO
    3. Explication de l'impact sur le référencement
    4. Suggestions d'amélioration de la structure sémantique`;

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
        temperature: 0.3, // Réduit pour plus de cohérence
        max_tokens: 2000,
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

    // Validation des suggestions
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

    // Vérification de la cohérence des suggestions
    const validateSuggestion = (text: string, type: string, minLength: number, maxLength: number) => {
      if (!text || typeof text !== 'string') {
        throw new Error(`${type} invalide: doit être une chaîne non vide`);
      }
      if (text.length < minLength || text.length > maxLength) {
        throw new Error(`${type} invalide: longueur ${text.length} caractères (attendu entre ${minLength} et ${maxLength})`);
      }
    };

    validateSuggestion(suggestions.suggested_title, 'Titre', 50, 60);
    validateSuggestion(suggestions.suggested_description, 'Description', 145, 155);
    validateSuggestion(suggestions.suggested_h1, 'H1', 20, 60);

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