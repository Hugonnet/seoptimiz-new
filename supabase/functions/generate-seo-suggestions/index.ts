import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log('Hello from generate-seo-suggestions!')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { currentTitle, currentDescription, currentH1, currentH2s, currentH3s, currentH4s } = await req.json()

    console.log('Received data:', {
      currentTitle,
      currentDescription,
      currentH1,
      currentH2s,
      currentH3s,
      currentH4s,
    })

    // Construct the prompt for OpenAI
    const systemPrompt = `Tu es un expert SEO qui analyse et optimise le contenu des pages web. 
    Pour chaque élément, tu dois :
    1. Analyser le contenu actuel
    2. Proposer une version optimisée
    3. Expliquer le contexte et la raison de l'optimisation

    Format de réponse attendu en JSON :
    {
      "suggested_title": "...",
      "title_context": "...",
      "suggested_description": "...",
      "description_context": "...",
      "suggested_h1": "...",
      "h1_context": "...",
      "suggested_h2s": ["..."],
      "h2s_context": ["..."],
      "suggested_h3s": ["..."],
      "h3s_context": ["..."],
      "suggested_h4s": ["..."],
      "h4s_context": ["..."]
    }`

    const userPrompt = `Voici les éléments actuels de la page :

    Titre : ${currentTitle || 'Non défini'}
    Description : ${currentDescription || 'Non définie'}
    H1 : ${currentH1 || 'Non défini'}
    H2s : ${currentH2s?.join(', ') || 'Non définis'}
    H3s : ${currentH3s?.join(', ') || 'Non définis'}
    H4s : ${currentH4s?.join(', ') || 'Non définis'}

    Analyse chaque élément et propose des optimisations SEO en suivant le format JSON demandé.`

    console.log('Sending request to OpenAI...')

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.7,
      }),
    })

    if (!openAIResponse.ok) {
      console.error('OpenAI API error:', await openAIResponse.text())
      throw new Error('Erreur lors de la génération des suggestions SEO')
    }

    const openAIData = await openAIResponse.json()
    console.log('OpenAI response:', openAIData)

    if (!openAIData.choices?.[0]?.message?.content) {
      throw new Error('Réponse OpenAI invalide')
    }

    try {
      const suggestions = JSON.parse(openAIData.choices[0].message.content)
      console.log('Parsed suggestions:', suggestions)

      return new Response(JSON.stringify(suggestions), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error('Error parsing OpenAI response:', error)
      throw new Error('Impossible de parser la réponse OpenAI en JSON')
    }
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Une erreur est survenue lors de la génération des suggestions SEO',
        details: error.toString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})