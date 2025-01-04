import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as cheerio from "https://deno.land/x/cheerio@1.0.7/mod.ts";

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
    const $ = cheerio.load(html);

    // Extract metadata
    const metadata = {
      title: $('title').text().trim(),
      description: $('meta[name="description"]').attr('content')?.trim(),
      h1: $('h1').first().text().trim(),
      h2s: $('h2').map((_, el) => $(el).text().trim()).get(),
      h3s: $('h3').map((_, el) => $(el).text().trim()).get(),
      h4s: $('h4').map((_, el) => $(el).text().trim()).get(),
      keywords: $('meta[name="keywords"]').attr('content')?.trim(),
      canonical: $('link[rel="canonical"]').attr('href')?.trim(),
      ogTitle: $('meta[property="og:title"]').attr('content')?.trim(),
      ogDescription: $('meta[property="og:description"]').attr('content')?.trim(),
      ogImage: $('meta[property="og:image"]').attr('content')?.trim(),
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