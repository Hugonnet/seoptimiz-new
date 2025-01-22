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

    const startTime = Date.now();
    console.log('Fetching URL content...');
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();
    const loadTime = (Date.now() - startTime) / 1000; // Convert to seconds
    console.log(`Page loaded in ${loadTime} seconds`);

    // Helper function to extract meta content
    const getMetaContent = (content: string, name: string): string => {
      const match = content.match(new RegExp(`<meta.*?(?:name|property)=["']${name}["'].*?content=["'](.*?)["']`, 'i'));
      return match ? match[1] : '';
    };

    // Helper function to extract all links
    const extractLinks = (content: string, baseUrl: string): { internal: string[], external: string[] } => {
      const links: { internal: string[], external: string[] } = { internal: [], external: [] };
      const hostname = new URL(baseUrl).hostname;
      
      const linkMatches = content.matchAll(/<a\s+(?:[^>]*?\s+)?href=["'](.*?)["']/gi);
      for (const match of Array.from(linkMatches)) {
        try {
          const href = match[1];
          if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) {
            continue;
          }
          
          let absoluteUrl = href;
          try {
            absoluteUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
          } catch (e) {
            console.warn('Invalid URL:', href);
            continue;
          }
          
          try {
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
            console.warn('Error processing URL:', absoluteUrl);
          }
        } catch (e) {
          console.warn('Invalid URL found:', match[1]);
        }
      }
      return links;
    };

    // Extract all metadata
    console.log('Extracting metadata...');
    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || '';
    const description = getMetaContent(html, 'description');
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
        console.warn('Error checking link:', link, e);
        brokenLinks.push(link);
      }
    });

    await Promise.all(checkPromises);

    console.log('Analysis complete');
    console.log('Links found:', {
      internal: internal.length,
      external: external.length,
      broken: brokenLinks.length
    });

    const metadata = {
      title,
      description,
      internal_links: internal,
      external_links: external,
      broken_links: brokenLinks,
      page_load_speed: loadTime
    };

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