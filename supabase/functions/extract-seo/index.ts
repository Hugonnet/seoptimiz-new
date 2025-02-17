
import { corsHeaders } from '../_shared/cors.ts';
import { load } from "https://esm.sh/cheerio@1.0.0-rc.12";

interface RequestBody {
  url: string;
}

interface SEOData {
  title: string;
  description: string;
  h1: string;
  h2s: string[];
  h3s: string[];
  h4s: string[];
  visibleText: string[];
  internalLinks: string[];
  externalLinks: string[];
  brokenLinks: string[];
}

async function checkBrokenLinks(links: string[]): Promise<string[]> {
  const brokenLinks: string[] = [];

  await Promise.all(
    links.map(async (link) => {
      try {
        const response = await fetch(link, { 
          method: 'HEAD',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        if (!response.ok) {
          brokenLinks.push(link);
        }
      } catch (error) {
        console.warn('Erreur lors de la vérification du lien:', link, error);
        brokenLinks.push(link);
      }
    })
  );

  return Array.from(new Set(brokenLinks));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json() as RequestBody;
    console.log('Extraction SEO pour:', url);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = load(html);
    const baseUrl = new URL(url);

    // Extraire les liens
    const internalLinks: string[] = [];
    const externalLinks: string[] = [];

    $('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      if (!href || href === '#' || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      try {
        const linkUrl = new URL(href, url);
        if (linkUrl.hostname === baseUrl.hostname) {
          internalLinks.push(linkUrl.href);
        } else {
          externalLinks.push(linkUrl.href);
        }
      } catch (error) {
        console.warn('URL invalide ignorée:', href);
      }
    });

    // Extraire les autres métadonnées
    const title = $('title').text().trim();
    const description = $('meta[name="description"]').attr('content') || '';
    const h1 = $('h1').first().text().trim();
    const h2s = $('h2').map((_, el) => $(el).text().trim()).get().filter(Boolean);
    const h3s = $('h3').map((_, el) => $(el).text().trim()).get().filter(Boolean);
    const h4s = $('h4').map((_, el) => $(el).text().trim()).get().filter(Boolean);

    // Vérifier les liens cassés
    const uniqueLinks = Array.from(new Set([...internalLinks, ...externalLinks]));
    const brokenLinks = await checkBrokenLinks(uniqueLinks);

    const seoData: SEOData = {
      title,
      description,
      h1,
      h2s,
      h3s,
      h4s,
      visibleText: [],
      internalLinks: Array.from(new Set(internalLinks)),
      externalLinks: Array.from(new Set(externalLinks)),
      brokenLinks
    };

    return new Response(JSON.stringify(seoData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur lors de l\'extraction SEO:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
