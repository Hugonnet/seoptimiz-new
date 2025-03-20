
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
  isProtectedPage: boolean;
}

// Ultra-enhanced helper function to clean extracted text
const cleanExtractedText = (text: string): string => {
  if (!text) return '';
  
  // Multi-stage cleaning process
  // Stage 1: Basic cleaning and normalization
  let cleaned = text
    .replace(/\s+/g, ' ')      // Replace multiple spaces with a single space
    .trim();                   // Remove leading and trailing whitespace
  
  // Stage 2: Remove bot protection patterns
  cleaned = cleaned
    // Remove common bot protection patterns with numeric sequences and dashes
    .replace(/(-\d+\s+)+/g, '')
    .replace(/(\s*-\d+){2,}/g, '')
    // Remove patterns like "-1 -2 -3 -4 2- -2vine e"
    .replace(/-\d+\s+-\d+\s+-\d+\s+-\d+\s+\d+-\s+-\d+vine\s+e/g, '')
    .replace(/-\d+vine\s+e/g, '')
    // Remove specific patterns identified in the data
    .replace(/\d+-\s+-\d+vine\s+e/g, '')
    .replace(/\d+-\s+[a-z]+\s+e/g, '')
    // Target specific pattern "2- -2vine e" at the end
    .replace(/\s+\d+[-]\s+[-]\d+vine\s+e$/g, '')
    // Handle more patterns of bot protection
    .replace(/\d+[-]\s+[-]?\d*vine\s?e\b/g, '')
    .replace(/\d+-\s*-\d*vine\s*e\b/g, '')
    // Broader pattern to catch number-dash-number variations
    .replace(/\d+\s*-\s*(-)?(\d*)?v?i?n?e?\s*e?\b/g, '')
    // Even more aggressive pattern to remove anything that looks like bot protection
    .replace(/\d+[-].*?v?i?n?e?\s*e?$/g, '')
    // Very aggressive approach - remove anything after a number-dash pattern at the end
    .replace(/\s+\d+[-].*$/g, '');
  
  // Stage 3: Remove CSS-like patterns and formatting artifacts
  cleaned = cleaned
    .replace(/(?:- ){2,}/g, '')         // Remove repeating dash patterns (- - - -)
    .replace(/[-]{2,}/g, ' ')           // Replace long dash sequences with space
    .replace(/(\s-\s-\s-)+/g, ' ')      // Remove formatted dash sequences
    .replace(/(\s-\s)+/g, ' ')          // Remove spaced dash sequences
    .replace(/\b[a-z]+[-][a-z]+[-][a-z]+\b/g, ' ')  // Remove CSS class name patterns
    .replace(/\b[a-z]+[-][a-z]+\b/g, ' ')           // Remove shorter CSS class name patterns
    .replace(/icon-[a-z-]+/g, ' ')                  // Remove icon class patterns
    .trim();
  
  // Stage 4: Ultra-aggressive final cleaning for stubborn patterns
  // Handle numeric patterns at the end that might be part of bot protection
  cleaned = cleaned
    .replace(/\s+\d+\s*-.*$/g, '') 
    .replace(/\s+\d+[-–—](?:\s*\d*)?(?:[-–—]\d*)?[-–—]?(?:[a-z]*\s*[a-z])?$/i, '')
    // Very aggressive - remove any sequence with numbers and dashes near the end
    .replace(/\s+[-–—]?\d+[-–—](?:.*)?$/g, '')
    .replace(/\s*\d+[-–—]\s*(?:[-–—]?\d*)?(?:[-–—]?\w*)?$/g, '')
    // Remove anything that looks like a numeric code at the end
    .replace(/\s+[-–—]?\d+.*$/g, '')
    .trim();
  
  // Stage 5: Last resort cleaning - if we still have suspicious content
  if (/\d+[-–—]/.test(cleaned) || /[-–—]\d+/.test(cleaned) || /\s+\d+\s+[-–—]/.test(cleaned)) {
    // If any suspicious patterns remain, try to extract just the first part before any numeric/dash pattern
    const parts = cleaned.split(/\s+\d+[-–—]|\s+[-–—]\d+/);
    if (parts.length > 0) {
      cleaned = parts[0].trim();
    }
  }
  
  // Final space normalization
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
  
  return cleaned;
};

// Function to detect if we hit a bot protection page
const isBotProtectionPage = (html: string, title: string): boolean => {
  const lowerHtml = html.toLowerCase();
  const lowerTitle = title.toLowerCase();
  
  // Common bot protection keywords in title
  const titleKeywords = [
    'bot verification',
    'captcha',
    'cloudflare',
    'security check',
    'ddos protection',
    'human verification',
    'verify you are human',
    'robot check',
    'browser check'
  ];
  
  // Check title for bot protection keywords
  if (titleKeywords.some(keyword => lowerTitle.includes(keyword))) {
    return true;
  }
  
  // Check HTML content for common bot protection services
  const htmlKeywords = [
    'cloudflare', 
    'captcha',
    'recaptcha',
    'hcaptcha',
    'ddos-guard',
    'verify you are a human',
    'checking if the site connection is secure',
    'verifying that you are not a robot',
    'performing a browser check',
    'please stand by while we verify'
  ];
  
  return htmlKeywords.some(keyword => lowerHtml.includes(keyword));
};

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

    // First, get the meta information from original document
    const titleRaw = $('title').text();
    const descriptionRaw = $('meta[name="description"]').attr('content') || '';
    
    // Check if this is a bot protection page
    const botProtectionDetected = isBotProtectionPage(html, titleRaw);
    console.log('Bot protection detected:', botProtectionDetected);
    
    if (botProtectionDetected) {
      console.log('Bot protection page detected. Alerting user.');
    }
    
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
    
    // More aggressive cleaning to remove all styling and attributes before extracting content
    $('*').each((_, el) => {
      // Remove all scripts and style elements completely
      if (el.tagName === 'script' || el.tagName === 'style') {
        $(el).remove();
        return;
      }
      
      const element = $(el);
      // Remove all attributes except essential ones
      const attrs = el.attributes;
      for (let i = attrs.length - 1; i >= 0; i--) {
        const attrName = attrs[i].name;
        if (!['href', 'src', 'alt'].includes(attrName)) {
          element.removeAttr(attrName);
        }
      }
    });
    
    // Now extract and clean heading content after removing all attributes
    const h1 = cleanExtractedText($('h1').first().text());
    const h2s = $('h2').map((_, el) => cleanExtractedText($(el).text())).get().filter(Boolean);
    const h3s = $('h3').map((_, el) => cleanExtractedText($(el).text())).get().filter(Boolean);
    const h4s = $('h4').map((_, el) => cleanExtractedText($(el).text())).get().filter(Boolean);

    // Get visible body text (excluding scripts, styles, etc.)
    const visibleText: string[] = [];
    $('body p, body li, body div:not(:has(*))').each((_, el) => {
      const text = cleanExtractedText($(el).text());
      if (text && text.length > 15) { // Only include meaningful text of sufficient length
        visibleText.push(text);
      }
    });
    
    // Now clean the original meta data with our ultra-aggressive cleaning
    const title = cleanExtractedText(titleRaw);
    const description = cleanExtractedText(descriptionRaw);
    
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
      visibleText,
      internalLinks: Array.from(internalLinks),
      externalLinks: Array.from(externalLinks),
      brokenLinks,
      isProtectedPage: botProtectionDetected
    };

    console.log('Données SEO extraites avec succès');
    console.log('Titre extrait:', title);
    console.log('Description extraite:', description);
    console.log('H1 extrait:', h1);
    console.log('Page protégée détectée:', botProtectionDetected);

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
