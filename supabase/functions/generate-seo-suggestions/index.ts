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

    Les suggestions doivent être concises et pertinentes, jamais de texte générique.
    
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
    }`

    const userPrompt = `Voici les éléments actuels de la page à optimiser :

    Titre : ${currentTitle || 'Non défini'}
    Description : ${currentDescription || 'Non définie'}
    H1 : ${currentH1 || 'Non défini'}
    H2s : ${currentH2s?.join(', ') || 'Non définis'}
    H3s : ${currentH3s?.join(', ') || 'Non définis'}
    H4s : ${currentH4s?.join(', ') || 'Non définis'}

    Analyse chaque élément et propose des optimisations SEO pertinentes en suivant STRICTEMENT le format JSON demandé.
    Les suggestions doivent être en français et adaptées au contexte de chaque balise.`

    console.log('Envoi de la requête à OpenAI avec les prompts suivants:')
    console.log('System prompt:', systemPrompt)
    console.log('User prompt:', userPrompt)

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      }),
    })

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
      
      // Validation basique du format
      const requiredKeys = [
        'suggested_title', 'title_context',
        'suggested_description', 'description_context',
        'suggested_h1', 'h1_context',
        'suggested_h2s', 'h2s_context',
        'suggested_h3s', 'h3s_context',
        'suggested_h4s', 'h4s_context'
      ]

      for (const key of requiredKeys) {
        if (!(key in suggestions)) {
          throw new Error(`Clé manquante dans la réponse JSON: ${key}`)
        }
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
})