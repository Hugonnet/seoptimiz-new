import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface KeywordDensity {
  keyword: string;
  count: number;
  density: number;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting keyword density analysis...');
    
    const { url } = await req.json();
    console.log('Analyzing URL:', url);

    if (!url) {
      console.error('No URL provided');
      throw new Error('URL is required');
    }

    // Fetch the page content
    console.log('Fetching page content...');
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Failed to fetch URL:', response.statusText);
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log('Successfully fetched page content');

    // Extract visible text
    console.log('Extracting visible text...');
    const visibleText = html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

    // Count words
    const words = visibleText.split(/\s+/);
    const totalWords = words.length;
    console.log('Total words found:', totalWords);

    // Calculate word frequency
    console.log('Calculating word frequency...');
    const wordFrequency: { [key: string]: number } = {};
    words.forEach(word => {
      if (word.length > 3) { // Ignore small words
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });

    // Calculate density and sort by frequency
    const keywordDensity: KeywordDensity[] = Object.entries(wordFrequency)
      .map(([keyword, count]) => ({
        keyword,
        count,
        density: (count / totalWords) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 keywords

    console.log('Analysis complete. Found', keywordDensity.length, 'keywords');

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
    console.error('Error in analyze-keyword-density:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error instanceof Error ? error.stack : 'Unknown error'
      }),
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