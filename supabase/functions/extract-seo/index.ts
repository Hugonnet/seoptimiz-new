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

    // Fetch with timeout and additional options
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