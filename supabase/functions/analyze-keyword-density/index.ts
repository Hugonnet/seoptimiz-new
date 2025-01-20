import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface KeywordDensity {
  keyword: string;
  count: number;
  density: number;
}

function getBigrams(words: string[]): string[] {
  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    if (words[i].length > 2 && words[i + 1].length > 2) { // Only consider words longer than 2 characters
      bigrams.push(`${words[i]} ${words[i + 1]}`);
    }
  }
  return bigrams;
}

serve(async (req) => {
  console.log("Function invoked with request:", req.method);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json();
    console.log("Received URL to analyze:", url);

    if (!url) {
      throw new Error('URL is required');
    }

    console.log("Fetching content from URL:", url);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log("Successfully fetched HTML content, length:", html.length);

    const visibleText = html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

    const words = visibleText.split(/\s+/);
    const totalWords = words.length;
    console.log("Total words found:", totalWords);

    // Analyze bigrams
    const bigrams = getBigrams(words);
    const bigramFrequency: { [key: string]: number } = {};
    bigrams.forEach(bigram => {
      bigramFrequency[bigram] = (bigramFrequency[bigram] || 0) + 1;
    });

    // Analyze single words
    const wordFrequency: { [key: string]: number } = {};
    words.forEach(word => {
      if (word.length > 3) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });

    // Combine and sort results
    const bigramDensity: KeywordDensity[] = Object.entries(bigramFrequency)
      .map(([keyword, count]) => ({
        keyword,
        count,
        density: (count / (totalWords - 1)) * 100 // Adjust for bigrams
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 bigrams

    const singleWordDensity: KeywordDensity[] = Object.entries(wordFrequency)
      .map(([keyword, count]) => ({
        keyword,
        count,
        density: (count / totalWords) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15); // Top 15 single words

    const keywordDensity = [...bigramDensity, ...singleWordDensity];

    console.log("Analysis complete, returning results");

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
    console.error("Error in analyze-keyword-density:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message 
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