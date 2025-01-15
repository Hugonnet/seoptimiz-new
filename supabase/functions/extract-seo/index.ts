import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

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
    console.log('Starting SEO extraction...');
    const { url } = await req.json();
    
    if (!url) {
      throw new Error('URL is required');
    }

    console.log('Fetching URL:', url);
    const response = await fetch(url);
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    if (!doc) {
      throw new Error('Failed to parse HTML');
    }

    // Extract basic SEO data
    const title = doc.querySelector('title')?.textContent || '';
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const h1 = doc.querySelector('h1')?.textContent || '';
    const h2s = Array.from(doc.querySelectorAll('h2')).map(h2 => h2.textContent || '');
    const h3s = Array.from(doc.querySelectorAll('h3')).map(h3 => h3.textContent || '');
    const h4s = Array.from(doc.querySelectorAll('h4')).map(h4 => h4.textContent || '');

    // Extract visible text for content analysis
    const visibleText = doc.body?.textContent?.trim() || '';
    const words = visibleText.split(/\s+/);
    const contentLength = words.length;

    // Calculate readability score
    const sentences = visibleText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = contentLength / (sentences.length || 1);
    const syllables = words.reduce((count, word) => {
      return count + (word.match(/[aeiouy]+/gi)?.length || 1);
    }, 0);
    const avgSyllablesPerWord = syllables / (words.length || 1);
    const readabilityScore = Math.max(0, Math.min(100, Math.round(
      206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
    )));

    // Analyze links
    const allLinks = Array.from(doc.querySelectorAll('a'));
    const internalLinks = allLinks
      .map(a => a.href)
      .filter(href => href && href.includes(new URL(url).hostname));
    const externalLinks = allLinks
      .map(a => a.href)
      .filter(href => href && !href.includes(new URL(url).hostname) && href.startsWith('http'));

    // Analyze images
    const images = Array.from(doc.querySelectorAll('img'));
    const imageAlts: Record<string, string> = {};
    images.forEach(img => {
      const src = img.getAttribute('src');
      const alt = img.getAttribute('alt');
      if (src && alt) {
        imageAlts[src] = alt;
      }
    });

    // Simulate page load speed based on content size
    const pageLoadSpeed = Math.min(5, Math.max(0.5, contentLength / 10000));

    // Check mobile friendliness
    const viewport = doc.querySelector('meta[name="viewport"]');
    const responsiveElements = doc.querySelectorAll('[class*="responsive"],[class*="mobile"],[class*="sm:"],[class*="md:"],[class*="lg:"]');
    const mobileFriendly = !!viewport || responsiveElements.length > 0;

    console.log('SEO data extracted successfully');

    const seoData = {
      title,
      description,
      h1,
      h2s,
      h3s,
      h4s,
      readabilityScore,
      contentLength,
      internalLinks,
      externalLinks,
      brokenLinks: [],
      imageAlts,
      pageLoadSpeed: Number(pageLoadSpeed.toFixed(2)),
      mobileFriendly,
      visibleText: [visibleText],
    };

    return new Response(JSON.stringify(seoData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in SEO extraction:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});