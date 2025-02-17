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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json() as RequestBody;
    console.log('Extraction SEO pour:', url);

    const response = await fetch(url);
    const html = await response.text();

    // Utiliser une expression régulière pour extraire les liens
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/g;
    const links: string[] = [];
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
      if (match[1]) {
        links.push(match[1]);
      }
    }

    const baseUrl = new URL(url);
    const internalLinks: string[] = [];
    const externalLinks: string[] = [];

    links.forEach(href => {
      if (!href || href === '#' || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      try {
        const linkUrl = new URL(href, baseUrl.href);
        if (linkUrl.hostname === baseUrl.hostname) {
          internalLinks.push(linkUrl.href);
        } else {
          externalLinks.push(linkUrl.href);
        }
      } catch (error) {
        console.warn('URL invalide ignorée:', href);
      }
    });

    // Extraction des autres balises avec des expressions régulières
    const titleRegex = /<title[^>]*>([^<]+)<\/title>/i;
    const titleMatch = html.match(titleRegex);
    const title = titleMatch ? titleMatch[1].trim() : '';

    const descriptionRegex = /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i;
    const descriptionMatch = html.match(descriptionRegex);
    const description = descriptionMatch ? descriptionMatch[1].trim() : '';

    const h1Regex = /<h1[^>]*>([^<]+)<\/h1>/i;
    const h1Match = html.match(h1Regex);
    const h1 = h1Match ? h1Match[1].trim() : '';

    // Extraction des h2s, h3s, h4s
    const extractHeadings = (html: string, tag: string) => {
      const regex = new RegExp(`<${tag}[^>]*>([^<]+)<\/${tag}>`, 'gi');
      const matches = [];
      let match;
      while ((match = regex.exec(html)) !== null) {
        matches.push(match[1].trim());
      }
      return matches;
    };

    const h2s = extractHeadings(html, 'h2');
    const h3s = extractHeadings(html, 'h3');
    const h4s = extractHeadings(html, 'h4');

    const seoData: SEOData = {
      title,
      description,
      h1,
      h2s,
      h3s,
      h4s,
      visibleText: [], // À implémenter si nécessaire
      internalLinks: Array.from(new Set(internalLinks)),
      externalLinks: Array.from(new Set(externalLinks)),
      brokenLinks: [], // Les liens cassés seront vérifiés côté client
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
