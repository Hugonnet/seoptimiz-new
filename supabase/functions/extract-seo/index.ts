
import { corsHeaders } from '../_shared/cors.ts';
import puppeteer from 'https://deno.land/x/puppeteer@16.2.0/mod.ts';

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

    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigation avec timeout augmenté
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Attendre un peu plus pour les sites qui chargent lentement
    await page.waitForTimeout(2000);

    // Extraire les métadonnées
    const seoData = await page.evaluate((baseUrl) => {
      const getLinks = () => {
        const currentHostname = new URL(baseUrl).hostname;
        const links = Array.from(document.getElementsByTagName('a'));
        const internalLinks: string[] = [];
        const externalLinks: string[] = [];

        links.forEach(link => {
          const href = link.href;
          if (!href || href === '#' || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            return;
          }

          try {
            const url = new URL(href);
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

      const { internalLinks, externalLinks } = getLinks();

      return {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
        h1: document.querySelector('h1')?.textContent?.trim() || '',
        h2s: Array.from(document.querySelectorAll('h2')).map(el => el.textContent?.trim() || '').filter(Boolean),
        h3s: Array.from(document.querySelectorAll('h3')).map(el => el.textContent?.trim() || '').filter(Boolean),
        h4s: Array.from(document.querySelectorAll('h4')).map(el => el.textContent?.trim() || '').filter(Boolean),
        internalLinks,
        externalLinks,
        visibleText: []
      };
    }, url);

    // Vérifier les liens cassés
    const uniqueLinks = Array.from(new Set([...seoData.internalLinks, ...seoData.externalLinks]));
    const brokenLinks = await checkBrokenLinks(uniqueLinks);

    await browser.close();

    const finalSeoData: SEOData = {
      ...seoData,
      brokenLinks
    };

    return new Response(JSON.stringify(finalSeoData), {
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
