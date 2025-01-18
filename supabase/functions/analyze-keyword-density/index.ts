import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

interface KeywordDensity {
  keyword: string;
  count: number;
  density: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()

    // Fetch the page content
    const response = await fetch(url)
    const html = await response.text()

    // Extract visible text (basic implementation)
    const visibleText = html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()

    // Count words
    const words = visibleText.split(/\s+/)
    const totalWords = words.length

    // Calculate word frequency
    const wordFrequency: { [key: string]: number } = {}
    words.forEach(word => {
      if (word.length > 3) { // Ignore small words
        wordFrequency[word] = (wordFrequency[word] || 0) + 1
      }
    })

    // Calculate density and sort by frequency
    const keywordDensity: KeywordDensity[] = Object.entries(wordFrequency)
      .map(([keyword, count]) => ({
        keyword,
        count,
        density: (count / totalWords) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20) // Top 20 keywords

    return new Response(
      JSON.stringify({
        keywordDensity,
        totalWords
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      },
    )
  }
})