
import { corsHeaders } from '../_shared/cors.ts';
import puppeteer from "puppeteer";

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

  let browser;
  try {
    const { url } = await req.json() as RequestBody;
    console.log('Extraction SEO pour:', url);

    // Lancer un navigateur headless
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Configurer le User-Agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Attendre que la page soit chargée
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Extraire les métadonnées après le chargement complet
    const seoData = await page.evaluate(() => {
      const getTextContent = (element: Element | null): string => 
        element ? element.textContent?.trim() || '' : '';

      const getArrayOfText = (elements: NodeListOf<Element>): string[] =>
        Array.from(elements).map(el => el.textContent?.trim() || '').filter(Boolean);

      const getLinks = (): { internalLinks: string[], externalLinks: string[] } => {
        const currentHostname = window.location.hostname;
        const links = Array.from(document.querySelectorAll('a[href]'));
        const internalLinks: string[] = [];
        const externalLinks: string[] = [];

        links.forEach(link => {
          const href = link.getAttribute('href');
          if (!href || href === '#' || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            return;
          }

          try {
            const url = new URL(href, window.location.href);
            if (url.hostname === currentHostname) {
              internalLinks.push(url.href);
            } else {
              externalLinks.push(url.href);
            }
          } catch (error) {
            console.warn('URL invalide ignorée:', href);
          }
        });

        return {
          internalLinks: Array.from(new Set(internalLinks)),
          externalLinks: Array.from(new Set(externalLinks))
        };
      };

      const title = document.title;
      const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const h1 = getTextContent(document.querySelector('h1'));
      const h2s = getArrayOfText(document.querySelectorAll('h2'));
      const h3s = getArrayOfText(document.querySelectorAll('h3'));
      const h4s = getArrayOfText(document.querySelectorAll('h4'));
      const { internalLinks, externalLinks } = getLinks();

      return {
        title,
        description,
        h1,
        h2s,
        h3s,
        h4s,
        internalLinks,
        externalLinks,
      };
    });

    // Vérifier les liens cassés
    const uniqueLinks = Array.from(new Set([...seoData.internalLinks, ...seoData.externalLinks]));
    const brokenLinks = await checkBrokenLinks(uniqueLinks);

    const fullSeoData: SEOData = {
      ...seoData,
      visibleText: [], // À implémenter si nécessaire
      brokenLinks,
    };

    await browser.close();

    return new Response(JSON.stringify(fullSeoData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erreur lors de l\'extraction SEO:', error);
    if (browser) {
      await browser.close();
    }
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
