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
    const { url } = await req.json();
    console.log('Analyzing URL:', url);

    // Fetch the webpage content
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    if (!doc) {
      throw new Error("Failed to parse HTML");
    }

    // Extract metadata
    const metadata = {
      title: doc.querySelector('title')?.textContent?.trim() || '',
      description: doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '',
      h1: doc.querySelector('h1')?.textContent?.trim() || '',
      h2s: Array.from(doc.querySelectorAll('h2')).map(el => el.textContent?.trim()).filter(Boolean),
      h3s: Array.from(doc.querySelectorAll('h3')).map(el => el.textContent?.trim()).filter(Boolean),
      h4s: Array.from(doc.querySelectorAll('h4')).map(el => el.textContent?.trim()).filter(Boolean),
      keywords: doc.querySelector('meta[name="keywords"]')?.getAttribute('content')?.trim(),
      canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute('href')?.trim(),
      ogTitle: doc.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim(),
      ogDescription: doc.querySelector('meta[property="og:description"]')?.getAttribute('content')?.trim(),
      ogImage: doc.querySelector('meta[property="og:image"]')?.getAttribute('content')?.trim(),
    };

    console.log('Extracted metadata:', metadata);

    return new Response(JSON.stringify(metadata), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in extract-seo function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred while extracting SEO data' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});