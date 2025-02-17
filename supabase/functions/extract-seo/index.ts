
import { corsHeaders } from '../_shared/cors.ts';

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

async function extractMetadata(html: string, baseUrl: string): Promise<Partial<SEOData>> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Extraire les liens
  const links = Array.from(doc.querySelectorAll('a[href]'));
  const internalLinks: string[] = [];
  const externalLinks: string[] = [];
  const baseUrlObj = new URL(baseUrl);

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href === '#' || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }

    try {
      const url = new URL(href, baseUrl);
      if (url.hostname === baseUrlObj.hostname) {
        internalLinks.push(url.href);
      } else {
        externalLinks.push(url.href);
      }
    } catch (error) {
      console.warn('URL invalide ignorée:', href);
    }
  });

  // Extraire les autres métadonnées
  const title = doc.querySelector('title')?.textContent || '';
  const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  const h1 = doc.querySelector('h1')?.textContent?.trim() || '';
  const h2s = Array.from(doc.querySelectorAll('h2')).map(el => el.textContent?.trim() || '').filter(Boolean);
  const h3s = Array.from(doc.querySelectorAll('h3')).map(el => el.textContent?.trim() || '').filter(Boolean);
  const h4s = Array.from(doc.querySelectorAll('h4')).map(el => el.textContent?.trim() || '').filter(Boolean);

  return {
    title,
    description,
    h1,
    h2s,
    h3s,
    h4s,
    internalLinks: Array.from(new Set(internalLinks)),
    externalLinks: Array.from(new Set(externalLinks))
  };
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
    const metadata = await extractMetadata(html, url);

    // Vérifier les liens cassés
    const uniqueLinks = Array.from(new Set([...metadata.internalLinks || [], ...metadata.externalLinks || []]));
    const brokenLinks = await checkBrokenLinks(uniqueLinks);

    const seoData: SEOData = {
      ...metadata as SEOData,
      visibleText: [],
      brokenLinks,
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
