import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    console.log('Analyzing URL:', url);

    const response = await fetch(url);
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    if (!doc) {
      throw new Error('Failed to parse HTML');
    }

    // Extraction des données SEO de base
    const title = doc.querySelector('title')?.textContent || '';
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const h1 = doc.querySelector('h1')?.textContent || '';
    const h2s = Array.from(doc.querySelectorAll('h2')).map(h2 => h2.textContent || '');
    const h3s = Array.from(doc.querySelectorAll('h3')).map(h3 => h3.textContent || '');
    const h4s = Array.from(doc.querySelectorAll('h4')).map(h4 => h4.textContent || '');

    // Analyse avancée
    const allText = doc.body?.textContent || '';
    const words = allText.trim().split(/\s+/);
    const contentLength = words.length;

    // Calcul du score de lisibilité (formule simple)
    const sentences = allText.split(/[.!?]+/);
    const avgWordsPerSentence = contentLength / sentences.length;
    const readabilityScore = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 15) * 5));

    // Analyse des liens
    const internalLinks = Array.from(doc.querySelectorAll('a'))
      .map(a => a.href)
      .filter(href => href && href.includes(new URL(url).hostname));

    const externalLinks = Array.from(doc.querySelectorAll('a'))
      .map(a => a.href)
      .filter(href => href && !href.includes(new URL(url).hostname));

    // Analyse des images
    const images = Array.from(doc.querySelectorAll('img'));
    const imageAlts: Record<string, string> = {};
    images.forEach(img => {
      const src = img.getAttribute('src');
      const alt = img.getAttribute('alt');
      if (src && alt) {
        imageAlts[src] = alt;
      }
    });

    // Simulation de la vitesse de chargement (à remplacer par une vraie mesure)
    const pageLoadSpeed = Math.random() * 3 + 1;

    // Vérification de la compatibilité mobile (basique)
    const viewport = doc.querySelector('meta[name="viewport"]');
    const mobileFriendly = !!viewport;

    const seoData = {
      title,
      description,
      h1,
      h2s,
      h3s,
      h4s,
      visibleText: [allText],
      readabilityScore: Math.round(readabilityScore),
      contentLength,
      internalLinks,
      externalLinks,
      imageAlts,
      pageLoadSpeed: Number(pageLoadSpeed.toFixed(2)),
      mobileFriendly,
    };

    console.log('SEO Analysis completed:', seoData);

    return new Response(JSON.stringify(seoData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in SEO analysis:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});