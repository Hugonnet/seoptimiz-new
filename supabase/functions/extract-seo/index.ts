import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Démarrage de l\'analyse SEO');
    
    // Vérification de la méthode HTTP
    if (req.method !== 'POST') {
      throw new Error('Méthode non autorisée. Utilisez POST.');
    }

    // Vérification et parsing du body
    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error('Content-Type doit être application/json');
    }

    let body;
    try {
      const text = await req.text();
      console.log('Body reçu:', text);
      body = JSON.parse(text);
    } catch (e) {
      throw new Error(`Erreur de parsing JSON: ${e.message}`);
    }

    const { url } = body;
    if (!url) {
      throw new Error('URL manquante dans la requête');
    }

    console.log('Analyse de l\'URL:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Impossible d'accéder à l'URL (${response.status})`);
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    if (!doc) {
      throw new Error("Impossible de parser le contenu HTML");
    }

    const getData = (selector: string) => doc.querySelector(selector)?.textContent?.trim() || '';
    const getMetaContent = (name: string) => doc.querySelector(`meta[name="${name}"]`)?.getAttribute('content')?.trim() || '';
    const getAllData = (selector: string) => Array.from(doc.querySelectorAll(selector)).map(el => el.textContent?.trim() || '');

    const seoData = {
      title: getData('title'),
      description: getMetaContent('description'),
      h1: getData('h1'),
      h2s: getAllData('h2'),
      h3s: getAllData('h3'),
      keywords: getMetaContent('keywords'),
      canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
      ogTitle: doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
      ogDescription: doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
      ogImage: doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || '',
    };

    console.log('Données SEO extraites avec succès');
    
    return new Response(JSON.stringify(seoData), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Erreur:', error.message);
    
    return new Response(
      JSON.stringify({ 
        error: `Erreur lors de l'analyse: ${error.message}` 
      }), 
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    );
  }
});