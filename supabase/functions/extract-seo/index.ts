
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json() as RequestBody;
    console.log('Extraction SEO pour:', url);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = load(html);
    const baseUrl = new URL(url);

    console.log('HTML récupéré, longueur:', html.length);

    // Extraire les liens avec gestion des chemins relatifs
    const internalLinks: Set<string> = new Set();
    const externalLinks: Set<string> = new Set();

    $('a').each((_, element) => {
      try {
        const href = $(element).attr('href');
        if (!href || href === '#' || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
          return;
        }

        // Normaliser l'URL
        let fullUrl: URL;
        try {
          fullUrl = new URL(href, baseUrl);
        } catch {
          console.warn('URL invalide ignorée:', href);
          return;
        }

        // Nettoyer l'URL
        const cleanUrl = fullUrl.origin + fullUrl.pathname + fullUrl.search;

        if (fullUrl.hostname === baseUrl.hostname) {
          internalLinks.add(cleanUrl);
        } else {
          externalLinks.add(cleanUrl);
        }
      } catch (error) {
        console.warn('Erreur lors du traitement du lien:', error);
      }
    });

    console.log('Liens internes trouvés:', internalLinks.size);
    console.log('Liens externes trouvés:', externalLinks.size);

    // Extraire les autres métadonnées
    const title = $('title').text().trim();
    const description = $('meta[name="description"]').attr('content') || '';
    const h1 = $('h1').first().text().trim();
    const h2s = $('h2').map((_, el) => $(el).text().trim()).get().filter(Boolean);
    const h3s = $('h3').map((_, el) => $(el).text().trim()).get().filter(Boolean);
    const h4s = $('h4').map((_, el) => $(el).text().trim()).get().filter(Boolean);

    // Test simple des liens cassés
    const brokenLinks: string[] = [];
    
    // Construire l'objet de retour
    const seoData: SEOData = {
      title,
      description,
      h1,
      h2s,
      h3s,
      h4s,
      visibleText: [],
      internalLinks: Array.from(internalLinks),
      externalLinks: Array.from(externalLinks),
      brokenLinks
    };

    console.log('Données SEO extraites avec succès');

    return new Response(JSON.stringify(seoData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur lors de l\'extraction SEO:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
