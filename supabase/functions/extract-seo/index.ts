import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Méthode non autorisée. Utilisez POST.');
    }

    const body = await req.json();
    console.log('Body reçu:', body);

    if (!body?.url) {
      throw new Error('URL manquante dans la requête');
    }

    const { url } = body;
    console.log('Analyse de l\'URL:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Impossible d'accéder à l'URL (${response.status})`);
    }

    const html = await response.text();
    console.log('HTML récupéré, longueur:', html.length);

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    if (!doc) {
      throw new Error("Impossible de parser le contenu HTML");
    }

    const getData = (selector: string) => {
      const element = doc.querySelector(selector);
      const text = element?.textContent?.trim() || '';
      console.log(`Extraction ${selector}:`, text);
      return text;
    };

    const getMetaContent = (name: string) => {
      const element = doc.querySelector(`meta[name="${name}"]`);
      const content = element?.getAttribute('content')?.trim() || '';
      console.log(`Extraction meta ${name}:`, content);
      return content;
    };

    const getAllData = (selector: string) => {
      const elements = Array.from(doc.querySelectorAll(selector));
      const texts = elements.map(el => el.textContent?.trim() || '');
      console.log(`Extraction all ${selector}:`, texts);
      return texts;
    };

    // Extraire le texte visible
    const getVisibleText = () => {
      const textNodes = Array.from(doc.querySelectorAll('p, li, span, div'))
        .map(el => el.textContent?.trim())
        .filter(text => text && text.length > 20); // Filtrer les textes courts
      return textNodes;
    };

    const seoData = {
      title: getData('title'),
      description: getMetaContent('description'),
      h1: getData('h1'),
      h2s: getAllData('h2'),
      h3s: getAllData('h3'),
      h4s: getAllData('h4'),
      visible_text: getVisibleText(),
      keywords: getMetaContent('keywords'),
      canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
      ogTitle: doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
      ogDescription: doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
      ogImage: doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || '',
    };

    console.log('Données SEO extraites:', seoData);
    
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