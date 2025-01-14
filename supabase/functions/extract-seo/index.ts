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

    if (!url) {
      throw new Error('URL is required');
    }

    // Create an AbortController to handle timeouts
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      if (!doc) {
        throw new Error("Failed to parse HTML");
      }

      // Function to clean text
      const cleanText = (text: string) => {
        return text?.trim().replace(/\s+/g, ' ') || '';
      };

      // Function to filter empty headings
      const isValidHeading = (text: string) => {
        const cleaned = cleanText(text);
        return cleaned && 
               cleaned !== 'undefined' && 
               cleaned !== 'null' && 
               cleaned.length > 1;
      };

      // Extract metadata with proper error handling
      const metadata = {
        title: cleanText(doc.querySelector('title')?.textContent),
        description: cleanText(doc.querySelector('meta[name="description"]')?.getAttribute('content')),
        h1: cleanText(doc.querySelector('h1')?.textContent),
        h2s: Array.from(doc.querySelectorAll('h2'))
          .map(el => cleanText(el.textContent))
          .filter(isValidHeading),
        h3s: Array.from(doc.querySelectorAll('h3'))
          .map(el => cleanText(el.textContent))
          .filter(isValidHeading),
        h4s: Array.from(doc.querySelectorAll('h4'))
          .map(el => cleanText(el.textContent))
          .filter(isValidHeading),
        visibleText: Array.from(doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6'))
          .map(el => cleanText(el.textContent))
          .filter(text => text.length > 0)
      };

      console.log('Successfully extracted metadata:', metadata);

      return new Response(JSON.stringify(metadata), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (fetchError) {
      clearTimeout(timeout);
      console.error('Fetch error:', fetchError);
      
      if (fetchError.name === 'AbortError') {
        throw new Error("La requête a expiré. Le site met trop de temps à répondre.");
      }
      
      throw new Error(`Impossible d'accéder au site. Vérifiez que l'URL est correcte et que le site est accessible. (${fetchError.message})`);
    }

  } catch (error) {
    console.error('Error in extract-seo function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Une erreur s'est produite lors de l'analyse du site" 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});