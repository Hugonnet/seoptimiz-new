import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Gestion des requêtes CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    console.log('Analyse de l\'URL:', url);
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL requise' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    if (!doc) {
      throw new Error('Impossible de parser le HTML');
    }

    const extractText = (selector: string) => {
      const element = doc?.querySelector(selector);
      return element?.textContent?.trim() || '';
    };

    const extractMetaContent = (name: string) => {
      const element = doc?.querySelector(`meta[name="${name}"]`);
      return element?.getAttribute('content')?.trim() || '';
    };

    const extractAll = (selector: string) => {
      const elements = doc?.querySelectorAll(selector);
      return Array.from(elements || []).map(el => el.textContent?.trim() || '');
    };

    console.log('Extraction des données SEO...');
    
    const seoData = {
      title: extractText('title'),
      description: extractMetaContent('description'),
      h1: extractText('h1'),
      h2s: extractAll('h2'),
      h3s: extractAll('h3'),
      keywords: extractMetaContent('keywords'),
      canonical: doc?.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
      ogTitle: doc?.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
      ogDescription: doc?.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
      ogImage: doc?.querySelector('meta[property="og:image"]')?.getAttribute('content') || '',
    };

    console.log('Données SEO extraites avec succès');
    
    return new Response(
      JSON.stringify(seoData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur lors de l\'extraction:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});