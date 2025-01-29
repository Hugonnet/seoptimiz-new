import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SpeedTestResult {
  loadTime: number
  pageSize: number
  requestCount: number
  errors: string[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()

    if (!url) {
      throw new Error('URL is required')
    }

    console.log('Testing speed for URL:', url)

    const startTime = performance.now()
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SeoSpeedTest/1.0;)'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    const endTime = performance.now()

    // Calculate basic metrics
    const loadTime = (endTime - startTime) / 1000 // Convert to seconds
    const pageSize = html.length / 1024 // Convert to KB
    
    // Count number of resources (scripts, styles, images)
    const resourceMatches = html.match(/<(script|link|img)[^>]*>/gi) || []
    const requestCount = resourceMatches.length + 1 // +1 for the initial HTML request

    const result: SpeedTestResult = {
      loadTime: Number(loadTime.toFixed(2)),
      pageSize: Math.round(pageSize),
      requestCount,
      errors: []
    }

    console.log('Speed test results:', result)

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error during speed test:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An error occurred during the speed test'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})