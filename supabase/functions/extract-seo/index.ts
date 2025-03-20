import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    console.log('Analyzing URL:', url);

    if (!url) {
      throw new Error('URL is required');
    }

    console.log('Fetching URL content...');
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();
    console.log('Extracting metadata from HTML...');

    // Helper function to extract meta content
    const getMetaContent = (content: string, name: string): string => {
      const match = content.match(new RegExp(`<meta.*?(?:name|property)=["']${name}["'].*?content=["'](.*?)["']`, 'i'));
      return match ? match[1] : '';
    };

    // Helper function to extract all links
    const extractLinks = (content: string, baseUrl: string): { internal: string[], external: string[] } => {
      const links: { internal: string[], external: string[] } = { internal: [], external: [] };
      const hostname = new URL(url).hostname;
      
      const linkMatches = content.matchAll(/<a\s+(?:[^>]*?\s+)?href=["'](.*?)["']/gi);
      for (const match of Array.from(linkMatches)) {
        try {
          const href = match[1];
          if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) {
            continue;
          }
          
          const absoluteUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
          const linkHostname = new URL(absoluteUrl).hostname;
          
          if (linkHostname === hostname) {
            if (!links.internal.includes(absoluteUrl)) {
              links.internal.push(absoluteUrl);
            }
          } else {
            if (!links.external.includes(absoluteUrl)) {
              links.external.push(absoluteUrl);
            }
          }
        } catch (e) {
          console.warn('Invalid URL found:', match[1]);
        }
      }
      return links;
    };

    // Helper function to extract headings
    const extractHeadings = (content: string, tag: string): string[] => {
      const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 'gi');
      const matches = Array.from(content.matchAll(regex));
      return matches.map(match => 
        match[1]
          .replace(/<[^>]+>/g, '')
          .trim()
      ).filter(Boolean);
    };

    // Extract all metadata
    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || '';
    const description = getMetaContent(html, 'description');
    const h1s = extractHeadings(html, 'h1');
    const h2s = extractHeadings(html, 'h2');
    const h3s = extractHeadings(html, 'h3');
    const h4s = extractHeadings(html, 'h4');
    const { internal, external } = extractLinks(html, url);
    
    // Check for broken links
    console.log('Checking for broken links...');
    const brokenLinks: string[] = [];
    const allLinks = [...internal, ...external];
    
    const checkPromises = allLinks.slice(0, 10).map(async (link) => {
      try {
        const response = await fetch(link, { method: 'HEAD' });
        if (!response.ok) {
          brokenLinks.push(link);
        }
      } catch (e) {
        brokenLinks.push(link);
      }
    });

    await Promise.all(checkPromises);

    const metadata = {
      title,
      description,
      h1: h1s[0] || '',
      h2s,
      h3s,
      h4s,
      keywords: getMetaContent(html, 'keywords'),
      canonical: html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["'](.*?)["']/i)?.[1] || '',
      ogTitle: getMetaContent(html, 'og:title'),
      ogDescription: getMetaContent(html, 'og:description'),
      ogImage: getMetaContent(html, 'og:image'),
      internal_links: internal,
      external_links: external,
      broken_links: brokenLinks,
      page_load_speed: (Date.now() - performance.now()) / 1000 // Approximate load time in seconds
    };

    console.log('Metadata extraction complete');
    console.log('Links found:', {
      internal: internal.length,
      external: external.length,
      broken: brokenLinks.length
    });

    return new Response(JSON.stringify(metadata), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error in extract-seo function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});