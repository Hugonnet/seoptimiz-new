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
    
    console.log('Données reçues pour analyse:', { 
      currentTitle, 
      currentDescription, 
      currentH1, 
      currentH2s, 
      currentH3s, 
      currentH4s 
    });

    const prompt = `En tant qu'expert SEO spécialisé dans l'optimisation de contenu web, analyse et optimise TOUTES les balises suivantes sans exception.
    
    Contenu actuel du site :
    ${currentTitle ? `Titre : "${currentTitle}"` : ''}
    ${currentDescription ? `Description : "${currentDescription}"` : ''}
    ${currentH1 ? `H1 : "${currentH1}"` : 'H1 : Aucune balise H1 trouvée'}
    ${currentH2s?.length ? `H2s : ${JSON.stringify(currentH2s)}` : ''}
    ${currentH3s?.length ? `H3s : ${JSON.stringify(currentH3s)}` : ''}
    ${currentH4s?.length ? `H4s : ${JSON.stringify(currentH4s)}` : ''}

    Instructions spécifiques :
    1. IMPORTANT : Tu DOIS proposer une version optimisée pour CHAQUE balise présente, sans exception
    2. Pour la balise H1, propose TOUJOURS une suggestion même si elle est absente du site
    3. Pour chaque balise H2, H3 et H4 présente, propose OBLIGATOIREMENT une version optimisée
    4. Respecte les bonnes pratiques SEO :
       - Titre : 50-60 caractères max
       - Meta description : 150-160 caractères max
       - H1 : unique et contenant le mot-clé principal
       - H2-H4 : structure hiérarchique cohérente
    5. Maintiens les mots-clés principaux tout en améliorant leur placement
    6. Optimise pour la lisibilité et l'engagement des utilisateurs
    7. Pour une balise H1 manquante, crée une suggestion basée sur le titre et la description
    8. VÉRIFIE que tu as bien fourni une suggestion pour CHAQUE balise présente

    Retourne UNIQUEMENT un objet JSON avec cette structure exacte :
    {
      "suggested_title": "titre optimisé si présent",
      "title_context": "explication détaillée de l'optimisation",
      "suggested_description": "description optimisée si présente",
      "description_context": "explication détaillée de l'optimisation",
      "suggested_h1": "H1 optimisé (TOUJOURS suggérer même si absent)",
      "h1_context": "explication détaillée de l'optimisation ou pourquoi un H1 est nécessaire",
      "suggested_h2s": ["H2 optimisé 1", "H2 optimisé 2"] si présents,
      "h2s_context": ["explication H2 1", "explication H2 2"],
      "suggested_h3s": ["H3 optimisé 1", "H3 optimisé 2"] si présents,
      "h3s_context": ["explication H3 1", "explication H3 2"],
      "suggested_h4s": ["H4 optimisé 1", "H4 optimisé 2"] si présents,
      "h4s_context": ["explication H4 1", "explication H4 2"]
    }`;

    console.log('Envoi du prompt à OpenAI:', prompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert SEO spécialisé dans l\'optimisation de contenu web. Tu DOIS TOUJOURS suggérer une balise H1, même si elle est absente du site. Tu DOIS OBLIGATOIREMENT proposer une optimisation pour CHAQUE balise présente, sans exception. Réponds UNIQUEMENT avec un objet JSON valide contenant tes suggestions, sans texte avant ou après.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('Erreur OpenAI:', await response.text());
      throw new Error('Erreur lors de la requête OpenAI');
    }

    const data = await response.json();
    console.log('Réponse OpenAI brute:', data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Réponse OpenAI invalide');
    }

    const content = data.choices[0].message.content.trim();
    console.log('Contenu de la réponse:', content);

    try {
      const suggestions = JSON.parse(content);
      console.log('Suggestions parsées:', suggestions);

      // Vérification stricte de la présence des suggestions pour chaque balise
      const requiredFields = [
        'suggested_title', 'title_context',
        'suggested_description', 'description_context',
        'suggested_h1', 'h1_context',
        'suggested_h2s', 'h2s_context',
        'suggested_h3s', 'h3s_context',
        'suggested_h4s', 'h4s_context'
      ];

      for (const field of requiredFields) {
        if (!(field in suggestions)) {
          throw new Error(`Champ manquant dans la réponse: ${field}`);
        }
      }

      // Vérification que chaque balise présente a une suggestion
      if (currentH2s?.length && (!suggestions.suggested_h2s || suggestions.suggested_h2s.length < currentH2s.length)) {
        throw new Error('Suggestions manquantes pour certaines balises H2');
      }
      if (currentH3s?.length && (!suggestions.suggested_h3s || suggestions.suggested_h3s.length < currentH3s.length)) {
        throw new Error('Suggestions manquantes pour certaines balises H3');
      }
      if (currentH4s?.length && (!suggestions.suggested_h4s || suggestions.suggested_h4s.length < currentH4s.length)) {
        throw new Error('Suggestions manquantes pour certaines balises H4');
      }

      // Filtrer les suggestions pour ne retourner que celles correspondant aux balises présentes
      const filteredSuggestions = {
        suggested_title: currentTitle ? suggestions.suggested_title : null,
        title_context: currentTitle ? suggestions.title_context : null,
        suggested_description: currentDescription ? suggestions.suggested_description : null,
        description_context: currentDescription ? suggestions.description_context : null,
        suggested_h1: suggestions.suggested_h1, // Toujours inclure la suggestion H1
        h1_context: suggestions.h1_context,
        suggested_h2s: currentH2s?.length ? suggestions.suggested_h2s.slice(0, currentH2s.length) : [],
        h2s_context: currentH2s?.length ? suggestions.h2s_context.slice(0, currentH2s.length) : [],
        suggested_h3s: currentH3s?.length ? suggestions.suggested_h3s.slice(0, currentH3s.length) : [],
        h3s_context: currentH3s?.length ? suggestions.h3s_context.slice(0, currentH3s.length) : [],
        suggested_h4s: currentH4s?.length ? suggestions.suggested_h4s.slice(0, currentH4s.length) : [],
        h4s_context: currentH4s?.length ? suggestions.h4s_context.slice(0, currentH4s.length) : []
      };

      return new Response(JSON.stringify(filteredSuggestions), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError);
      console.error('Contenu qui a causé l\'erreur:', content);
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