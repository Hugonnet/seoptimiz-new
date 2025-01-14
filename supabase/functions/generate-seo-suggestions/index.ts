import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { currentTitle, currentDescription, currentH1, currentH2s, currentH3s, currentH4s } = await req.json()

    const systemPrompt = `Tu es un expert SEO qui analyse et optimise le contenu des pages web en français. 
    Pour chaque élément, tu dois :
    1. Analyser le contenu actuel
    2. Proposer une version optimisée plus descriptive et pertinente
    3. Expliquer brièvement pourquoi cette optimisation est meilleure

    Les suggestions doivent être concises et pertinentes, jamais de texte générique comme "Optimisez cette balise".
    
    Format de réponse attendu en JSON :
    {
      "suggested_title": "Version optimisée du titre",
      "title_context": "Explication courte de l'amélioration",
      "suggested_description": "Version optimisée de la description",
      "description_context": "Explication courte de l'amélioration",
      "suggested_h1": "Version optimisée du H1",
      "h1_context": "Explication courte de l'amélioration",
      "suggested_h2s": ["Version optimisée H2 1", "Version optimisée H2 2"],
      "h2s_context": ["Explication H2 1", "Explication H2 2"],
      "suggested_h3s": ["Version optimisée H3 1", "Version optimisée H3 2"],
      "h3s_context": ["Explication H3 1", "Explication H3 2"],
      "suggested_h4s": ["Version optimisée H4 1", "Version optimisée H4 2"],
      "h4s_context": ["Explication H4 1", "Explication H4 2"]
    }`

    const userPrompt = `Voici les éléments actuels de la page à optimiser :

    Titre : ${currentTitle || 'Non défini'}
    Description : ${currentDescription || 'Non définie'}
    H1 : ${currentH1 || 'Non défini'}
    H2s : ${currentH2s?.join(', ') || 'Non définis'}
    H3s : ${currentH3s?.join(', ') || 'Non définis'}
    H4s : ${currentH4s?.join(', ') || 'Non définis'}

    Analyse chaque élément et propose des optimisations SEO pertinentes en suivant le format JSON demandé.
    Les suggestions doivent être en français et adaptées au contexte de chaque balise.`

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      }),
    })

    if (!openAIResponse.ok) {
      throw new Error('Erreur lors de la génération des suggestions SEO')
    }

    const openAIData = await openAIResponse.json()

    if (!openAIData.choices?.[0]?.message?.content) {
      throw new Error('Réponse OpenAI invalide')
    }

    try {
      const suggestions = JSON.parse(openAIData.choices[0].message.content)
      return new Response(JSON.stringify(suggestions), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (error) {
      throw new Error('Impossible de parser la réponse OpenAI en JSON')
    }
  } catch (error) {
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
})