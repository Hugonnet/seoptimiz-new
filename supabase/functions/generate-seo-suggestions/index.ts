import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.3.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { currentTitle, currentDescription, currentH1, currentH2s, currentH3s, currentH4s, visibleText, url } = await req.json()

    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })
    const openai = new OpenAIApi(configuration)

    const titleResponse = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an SEO expert. Analyze the current title and suggest an optimized version with explanation."
        },
        {
          role: "user",
          content: `Current title: "${currentTitle}". URL: ${url}`
        }
      ]
    })

    const descriptionResponse = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an SEO expert. Analyze the current meta description and suggest an optimized version with explanation."
        },
        {
          role: "user",
          content: `Current description: "${currentDescription}". URL: ${url}`
        }
      ]
    })

    const h1Response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an SEO expert. Analyze the current H1 heading and suggest an optimized version with explanation."
        },
        {
          role: "user",
          content: `Current H1: "${currentH1}". URL: ${url}`
        }
      ]
    })

    const h2Response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an SEO expert. Analyze the current H2 headings structure and provide recommendations for improvement."
        },
        {
          role: "user",
          content: `Current H2s: ${JSON.stringify(currentH2s)}. URL: ${url}`
        }
      ]
    })

    const h3Response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an SEO expert. Analyze the current H3 headings structure and provide recommendations for improvement."
        },
        {
          role: "user",
          content: `Current H3s: ${JSON.stringify(currentH3s)}. URL: ${url}`
        }
      ]
    })

    const h4Response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an SEO expert. Analyze the current H4 headings structure and provide recommendations for improvement."
        },
        {
          role: "user",
          content: `Current H4s: ${JSON.stringify(currentH4s)}. URL: ${url}`
        }
      ]
    })

    const suggestions = {
      suggested_title: titleResponse.data.choices[0]?.message?.content?.split('\n')[0] || '',
      title_context: titleResponse.data.choices[0]?.message?.content?.split('\n').slice(1).join('\n') || '',
      suggested_description: descriptionResponse.data.choices[0]?.message?.content?.split('\n')[0] || '',
      description_context: descriptionResponse.data.choices[0]?.message?.content?.split('\n').slice(1).join('\n') || '',
      suggested_h1: h1Response.data.choices[0]?.message?.content?.split('\n')[0] || '',
      h1_context: h1Response.data.choices[0]?.message?.content?.split('\n').slice(1).join('\n') || '',
      suggested_h2s: currentH2s || [],
      h2s_context: [h2Response.data.choices[0]?.message?.content || ''],
      suggested_h3s: currentH3s || [],
      h3s_context: [h3Response.data.choices[0]?.message?.content || ''],
      suggested_h4s: currentH4s || [],
      h4s_context: [h4Response.data.choices[0]?.message?.content || ''],
      readability_score: calculateReadabilityScore(visibleText),
      content_length: calculateContentLength(visibleText),
      internal_links: extractInternalLinks(visibleText, url),
      external_links: extractExternalLinks(visibleText, url),
      broken_links: await checkBrokenLinks(extractAllLinks(visibleText)),
      image_alts: extractImageAlts(visibleText),
      page_load_speed: calculatePageLoadSpeed(visibleText),
      mobile_friendly: checkMobileFriendly(visibleText)
    }

    return new Response(
      JSON.stringify(suggestions),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  }
})

function calculateReadabilityScore(text: string[]): number {
  // Simple implementation - can be enhanced with more sophisticated algorithms
  const words = text.join(' ').split(/\s+/).length
  const sentences = text.join(' ').split(/[.!?]+/).length
  return sentences > 0 ? words / sentences : 0
}

function calculateContentLength(text: string[]): number {
  return text.join(' ').length
}

function extractInternalLinks(text: string[], baseUrl: string): string[] {
  // Simple implementation - should be enhanced with proper URL parsing
  const urlPattern = /https?:\/\/[^\s]+/g
  const allUrls = text.join(' ').match(urlPattern) || []
  return allUrls.filter(url => url.includes(new URL(baseUrl).hostname))
}

function extractExternalLinks(text: string[], baseUrl: string): string[] {
  const urlPattern = /https?:\/\/[^\s]+/g
  const allUrls = text.join(' ').match(urlPattern) || []
  return allUrls.filter(url => !url.includes(new URL(baseUrl).hostname))
}

function extractAllLinks(text: string[]): string[] {
  const urlPattern = /https?:\/\/[^\s]+/g
  return text.join(' ').match(urlPattern) || []
}

async function checkBrokenLinks(urls: string[]): Promise<string[]> {
  const brokenLinks: string[] = []
  for (const url of urls) {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      if (!response.ok) {
        brokenLinks.push(url)
      }
    } catch {
      brokenLinks.push(url)
    }
  }
  return brokenLinks
}

function extractImageAlts(text: string[]): Record<string, string> {
  // Simplified implementation - should use proper HTML parsing
  const imgPattern = /<img[^>]+alt=["']([^"']+)["'][^>]*>/g
  const srcPattern = /src=["']([^"']+)["']/
  const alts: Record<string, string> = {}
  
  text.forEach(content => {
    let match
    while ((match = imgPattern.exec(content)) !== null) {
      const srcMatch = content.slice(match.index).match(srcPattern)
      if (srcMatch) {
        alts[srcMatch[1]] = match[1]
      }
    }
  })
  
  return alts
}

function calculatePageLoadSpeed(text: string[]): number {
  // Placeholder implementation - should be replaced with actual performance metrics
  return Math.random() * 5 + 1 // Returns a random number between 1 and 6
}

function checkMobileFriendly(text: string[]): boolean {
  // Placeholder implementation - should be replaced with actual mobile-friendliness check
  return true
}