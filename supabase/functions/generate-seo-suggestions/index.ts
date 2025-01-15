import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.1.0'
import { corsHeaders } from '../_shared/cors.ts'

const openAIConfig = new Configuration({
  apiKey: Deno.env.get('OPENAI_API_KEY')
})
const openai = new OpenAIApi(openAIConfig)

interface SEOData {
  currentTitle?: string
  currentDescription?: string
  currentH1?: string
  currentH2s?: string[]
  currentH3s?: string[]
  currentH4s?: string[]
  visibleText?: string[]
  url: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url, currentTitle, currentDescription, currentH1, currentH2s, currentH3s, currentH4s, visibleText } = await req.json() as SEOData

    console.log('Analyzing URL:', url)
    console.log('Current title:', currentTitle)

    // Prepare content for analysis
    const content = {
      title: currentTitle || '',
      description: currentDescription || '',
      h1: currentH1 || '',
      h2s: currentH2s || [],
      h3s: currentH3s || [],
      h4s: currentH4s || [],
      text: visibleText || []
    }

    // Generate title suggestion
    const titlePrompt = `En tant qu'expert SEO, analyse ce titre de page web : "${content.title}" pour le site ${url}.
    Propose un nouveau titre optimisé qui :
    - Conserve les mots-clés importants
    - A une longueur idéale (50-60 caractères)
    - Est accrocheur et pertinent
    - Inclut si possible le nom de la marque
    Réponds uniquement avec le titre optimisé, sans explications.`

    const titleCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: titlePrompt }]
    })

    const suggestedTitle = titleCompletion.data.choices[0]?.message?.content || ''

    // Generate title context
    const titleContextPrompt = `Explique brièvement pourquoi ce nouveau titre "${suggestedTitle}" est meilleur que l'original "${content.title}" en termes de SEO.`

    const titleContextCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: titleContextPrompt }]
    })

    const titleContext = titleContextCompletion.data.choices[0]?.message?.content || ''

    // Generate description suggestion
    const descriptionPrompt = `En tant qu'expert SEO, analyse cette meta description : "${content.description}" pour le site ${url}.
    Propose une nouvelle description qui :
    - Résume clairement le contenu de la page
    - Inclut les mots-clés principaux naturellement
    - Est engageante avec un call-to-action
    - Fait entre 150-160 caractères
    Réponds uniquement avec la description optimisée, sans explications.`

    const descriptionCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: descriptionPrompt }]
    })

    const suggestedDescription = descriptionCompletion.data.choices[0]?.message?.content || ''

    // Generate description context
    const descriptionContextPrompt = `Explique brièvement pourquoi cette nouvelle meta description "${suggestedDescription}" est meilleure que l'originale "${content.description}" en termes de SEO.`

    const descriptionContextCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: descriptionContextPrompt }]
    })

    const descriptionContext = descriptionContextCompletion.data.choices[0]?.message?.content || ''

    // Generate H1 suggestion
    const h1Prompt = `En tant qu'expert SEO, analyse ce H1 : "${content.h1}" pour le site ${url}.
    Propose un nouveau H1 qui :
    - Reflète précisément le contenu principal
    - Inclut le mot-clé principal naturellement
    - Est accrocheur et informatif
    - A une longueur optimale (20-70 caractères)
    Réponds uniquement avec le H1 optimisé, sans explications.`

    const h1Completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: h1Prompt }]
    })

    const suggestedH1 = h1Completion.data.choices[0]?.message?.content || ''

    // Generate H1 context
    const h1ContextPrompt = `Explique brièvement pourquoi ce nouveau H1 "${suggestedH1}" est meilleur que l'original "${content.h1}" en termes de SEO.`

    const h1ContextCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: h1ContextPrompt }]
    })

    const h1Context = h1ContextCompletion.data.choices[0]?.message?.content || ''

    // Generate H2s suggestions
    const suggestedH2s = await Promise.all(
      content.h2s.map(async (h2) => {
        const h2Prompt = `En tant qu'expert SEO, analyse ce H2 : "${h2}" pour le site ${url}.
        Propose un nouveau H2 qui :
        - Structure clairement la section
        - Utilise des mots-clés secondaires pertinents
        - Est informatif et engageant
        Réponds uniquement avec le H2 optimisé, sans explications.`

        const h2Completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: h2Prompt }]
        })

        return h2Completion.data.choices[0]?.message?.content || h2
      })
    )

    // Generate H2s context
    const h2sContextPrompt = `Explique brièvement pourquoi la nouvelle structure des H2 est meilleure en termes de SEO et de hiérarchie de contenu.
    Originaux : ${content.h2s.join(' | ')}
    Optimisés : ${suggestedH2s.join(' | ')}`

    const h2sContextCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: h2sContextPrompt }]
    })

    const h2sContext = h2sContextCompletion.data.choices[0]?.message?.content || ''

    // Calculate readability score (simple implementation)
    const calculateReadabilityScore = (text: string[]): number => {
      const words = text.join(' ').split(/\s+/).length
      const sentences = text.join(' ').split(/[.!?]+/).length
      const averageWordsPerSentence = words / sentences
      
      // Score based on average words per sentence (15-20 is ideal)
      let score = 100
      if (averageWordsPerSentence > 25) score -= 20
      if (averageWordsPerSentence > 20) score -= 10
      if (averageWordsPerSentence < 10) score -= 10
      
      return Math.max(0, Math.min(100, score))
    }

    const readabilityScore = calculateReadabilityScore(content.text)
    const contentLength = content.text.join(' ').split(/\s+/).length

    // Return all suggestions and metrics
    return new Response(
      JSON.stringify({
        suggested_title: suggestedTitle,
        suggested_description: suggestedDescription,
        suggested_h1: suggestedH1,
        suggested_h2s: suggestedH2s,
        suggested_h3s: content.h3s, // Keep original for now
        suggested_h4s: content.h4s, // Keep original for now
        title_context: titleContext,
        description_context: descriptionContext,
        h1_context: h1Context,
        h2s_context: h2sContext,
        readability_score: readabilityScore,
        content_length: contentLength
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error generating SEO suggestions:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})