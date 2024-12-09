import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  console.log('Function called with method:', req.method);
  
  // Gestion des requêtes CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error(`Method ${req.method} not allowed`);
    }

    // Log the request body for debugging
    const requestText = await req.text();
    console.log('Raw request body:', requestText);

    // Try to parse the JSON
    let body;
    try {
      body = JSON.parse(requestText);
    } catch (e) {
      console.error('JSON parse error:', e);
      throw new Error(`Invalid JSON in request body: ${e.message}`);
    }

    const { url } = body;
    console.log('Analyzing URL:', url);
    
    if (!url) {
      throw new Error('URL parameter is required');
    }

    if (!url.startsWith('http')) {
      throw new Error('Invalid URL format. URL must start with http:// or https://');
    }

    console.log('Fetching URL content...');
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log('HTML content received, length:', html.length);
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    if (!doc) {
      throw new Error('Failed to parse HTML content');
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

    console.log('Extracting SEO data...');
    
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

    console.log('SEO data extracted successfully:', seoData);
    
    return new Response(
      JSON.stringify(seoData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in extract-seo function:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        name: error.name 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    );
  }
});