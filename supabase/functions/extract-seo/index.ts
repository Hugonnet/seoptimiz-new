import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { chromium } from "https://deno.land/x/playwright@v1.39.0/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

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

    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    console.log('Navigating to URL...');
    await page.goto(url, { waitUntil: 'networkidle' });

    console.log('Extracting metadata...');
    const metadata = await page.evaluate(() => {
      const getMetaContent = (name: string) => {
        const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
        return meta ? (meta as HTMLMetaElement).content : '';
      };

      const getHeadings = (tag: string) => {
        return Array.from(document.querySelectorAll(tag)).map(h => h.textContent?.trim()).filter(Boolean);
      };

      const getVisibleText = () => {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: function(node) {
              if (node.parentElement?.offsetParent !== null) {
                return NodeFilter.FILTER_ACCEPT;
              }
              return NodeFilter.FILTER_REJECT;
            }
          }
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
          const text = node.textContent?.trim();
          if (text) {
            textNodes.push(text);
          }
        }
        return textNodes;
      };

      return {
        title: document.title,
        description: getMetaContent('description'),
        h1: document.querySelector('h1')?.textContent?.trim() || '',
        h2s: getHeadings('h2'),
        h3s: getHeadings('h3'),
        h4s: getHeadings('h4'),
        visibleText: getVisibleText(),
        keywords: getMetaContent('keywords'),
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
        ogTitle: getMetaContent('og:title'),
        ogDescription: getMetaContent('og:description'),
        ogImage: getMetaContent('og:image')
      };
    });

    console.log('Metadata extracted successfully');
    await browser.close();

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