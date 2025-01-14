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

    const systemPrompt = `Tu es un expert SEO spécialisé dans l'optimisation de contenu en français.
    Pour chaque élément HTML (title, description, h1-h4), tu dois :
    1. Analyser le contenu actuel
    2. Proposer une version optimisée plus descriptive et pertinente
    3. Expliquer brièvement pourquoi cette optimisation est meilleure

    IMPORTANT: 
    - Les suggestions doivent être concises, pertinentes et cohérentes avec le contenu existant
    - Chaque balise doit avoir une suggestion unique et adaptée
    - Les suggestions doivent respecter la hiérarchie des titres (h1 > h2 > h3 > h4)
    - Éviter absolument les suggestions génériques ou répétitives
    - Toujours garder le même nombre de suggestions que de balises existantes
    
    Format de réponse STRICT en JSON :
    {
      "suggested_title": "string",
      "title_context": "string",
      "suggested_description": "string",
      "description_context": "string",
      "suggested_h1": "string",
      "h1_context": "string",
      "suggested_h2s": ["string"],
      "h2s_context": ["string"],
      "suggested_h3s": ["string"],
      "h3s_context": ["string"],
      "suggested_h4s": ["string"],
      "h4s_context": ["string"]
    }

    Les arrays doivent avoir exactement le même nombre d'éléments que les balises d'origine.`

    const userPrompt = `Voici les éléments actuels de la page à optimiser pour une entreprise de chauffage écologique :

    Titre : ${currentTitle || 'Non défini'}
    Description : ${currentDescription || 'Non définie'}
    H1 : ${currentH1 || 'Non défini'}
    H2s : ${currentH2s?.join(', ') || 'Non définis'}
    H3s : ${currentH3s?.join(', ') || 'Non définis'}
    H4s : ${currentH4s?.join(', ') || 'Non définis'}

    Analyse chaque élément et propose des optimisations SEO pertinentes en suivant STRICTEMENT le format JSON demandé.
    Les suggestions doivent être en français, adaptées au contexte de chaque balise et cohérentes avec la hiérarchie des titres.
    
    IMPORTANT: Assure-toi de générer une suggestion pour CHAQUE balise H3 et H4 existante, sans en omettre.`

    console.log('Envoi de la requête à OpenAI avec les prompts suivants:')
    console.log('System prompt:', systemPrompt)
    console.log('User prompt:', userPrompt)

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      console.error('Erreur OpenAI:', await openAIResponse.text())
      throw new Error('Erreur lors de la génération des suggestions SEO')
    }

    const openAIData = await openAIResponse.json()
    console.log('Réponse OpenAI brute:', openAIData)

    if (!openAIData.choices?.[0]?.message?.content) {
      throw new Error('Réponse OpenAI invalide ou vide')
    }

    try {
      const content = openAIData.choices[0].message.content
      console.log('Contenu à parser:', content)
      const suggestions = JSON.parse(content.trim())
      
      // Validation du format et de la cohérence
      const requiredKeys = [
        'suggested_title', 'title_context',
        'suggested_description', 'description_context',
        'suggested_h1', 'h1_context',
        'suggested_h2s', 'h2s_context',
        'suggested_h3s', 'h3s_context',
        'suggested_h4s', 'h4s_context'
      ]

      // Vérifie que toutes les clés requises sont présentes
      for (const key of requiredKeys) {
        if (!(key in suggestions)) {
          throw new Error(`Clé manquante dans la réponse JSON: ${key}`)
        }
      }

      // Vérifie que les tableaux ont le bon nombre d'éléments
      if (currentH2s && suggestions.suggested_h2s.length !== currentH2s.length) {
        throw new Error('Nombre incorrect de suggestions H2')
      }
      if (currentH3s && suggestions.suggested_h3s.length !== currentH3s.length) {
        throw new Error('Nombre incorrect de suggestions H3')
      }
      if (currentH4s && suggestions.suggested_h4s.length !== currentH4s.length) {
        throw new Error('Nombre incorrect de suggestions H4')
      }

      return new Response(JSON.stringify(suggestions), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error('Erreur de parsing JSON:', error)
      console.error('Contenu qui a causé l\'erreur:', openAIData.choices[0].message.content)
      throw new Error('Impossible de parser la réponse OpenAI en JSON valide')
    }
  } catch (error) {
    console.error('Erreur complète:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Une erreur est survenue lors de la génération des suggestions SEO',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
});