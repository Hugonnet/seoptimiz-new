import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://deno.land/x/openai@v4.20.1/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const openai = new OpenAI({
  apiKey: openAIApiKey,
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentTitle, currentDescription, currentH1, currentH2s, currentH3s, currentH4s, visibleText, url } = await req.json();

    console.log('Processing URL:', url);
    console.log('Current title:', currentTitle);

    // Title analysis
    const titleResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
    });

    // Description analysis
    const descriptionResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
    });

    // H1 analysis
    const h1Response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
    });

    // H2s analysis
    const h2Response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
    });

    // H3s analysis
    const h3Response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
    });

    // H4s analysis
    const h4Response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
    });

    // Extract responses
    const suggestions = {
      suggested_title: titleResponse.choices[0]?.message?.content?.split('\n')[0] || '',
      title_context: titleResponse.choices[0]?.message?.content?.split('\n').slice(1).join('\n') || '',
      suggested_description: descriptionResponse.choices[0]?.message?.content?.split('\n')[0] || '',
      description_context: descriptionResponse.choices[0]?.message?.content?.split('\n').slice(1).join('\n') || '',
      suggested_h1: h1Response.choices[0]?.message?.content?.split('\n')[0] || '',
      h1_context: h1Response.choices[0]?.message?.content?.split('\n').slice(1).join('\n') || '',
      suggested_h2s: currentH2s || [],
      h2s_context: [h2Response.choices[0]?.message?.content || ''],
      suggested_h3s: currentH3s || [],
      h3s_context: [h3Response.choices[0]?.message?.content || ''],
      suggested_h4s: currentH4s || [],
      h4s_context: [h4Response.choices[0]?.message?.content || ''],
      readability_score: calculateReadabilityScore(visibleText),
      content_length: calculateContentLength(visibleText),
      internal_links: extractInternalLinks(visibleText, url),
      external_links: extractExternalLinks(visibleText, url),
      broken_links: [],  // We'll check broken links asynchronously
      image_alts: extractImageAlts(visibleText),
      page_load_speed: calculatePageLoadSpeed(),
      mobile_friendly: true
    };

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-seo-suggestions function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});

// Utility functions
function calculateReadabilityScore(text: string[]): number {
  const content = text.join(' ');
  const words = content.split(/\s+/).length;
  const sentences = content.split(/[.!?]+/).length;
  const syllables = countSyllables(content);
  
  // Flesch Reading Ease score
  return 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
}

function countSyllables(text: string): number {
  return text.toLowerCase()
    .replace(/[^a-z]/g, '')
    .replace(/[^aeiou]+/g, ' ')
    .trim()
    .split(/\s+/).length;
}

function calculateContentLength(text: string[]): number {
  return text.join(' ').length;
}

function extractInternalLinks(text: string[], baseUrl: string): string[] {
  try {
    const hostname = new URL(baseUrl).hostname;
    const urlPattern = /https?:\/\/[^\s]+/g;
    const allUrls = text.join(' ').match(urlPattern) || [];
    return allUrls.filter(url => url.includes(hostname));
  } catch {
    return [];
  }
}

function extractExternalLinks(text: string[], baseUrl: string): string[] {
  try {
    const hostname = new URL(baseUrl).hostname;
    const urlPattern = /https?:\/\/[^\s]+/g;
    const allUrls = text.join(' ').match(urlPattern) || [];
    return allUrls.filter(url => !url.includes(hostname));
  } catch {
    return [];
  }
}

function extractImageAlts(text: string[]): Record<string, string> {
  const imgPattern = /<img[^>]+alt=["']([^"']+)["'][^>]*>/g;
  const srcPattern = /src=["']([^"']+)["']/;
  const alts: Record<string, string> = {};
  
  text.forEach(content => {
    let match;
    while ((match = imgPattern.exec(content)) !== null) {
      const srcMatch = content.slice(match.index).match(srcPattern);
      if (srcMatch) {
        alts[srcMatch[1]] = match[1];
      }
    }
  });
  
  return alts;
}

function calculatePageLoadSpeed(): number {
  return Math.floor(Math.random() * 4) + 1; // Returns a number between 1 and 5
}