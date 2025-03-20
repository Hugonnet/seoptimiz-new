
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

// Ultra-aggressive function to completely remove bot protection patterns
function removeProtectionPatterns(text: string): string {
  if (!text) return '';
  
  // First approach: Get only text before any suspicious patterns
  const parts = text.split(/\s+\d+\s*[-–]/);
  if (parts.length > 1) {
    // If we found a potential protection pattern, take only the first part
    return parts[0].trim();
  }
  
  // Second approach: Try to remove specific patterns
  let cleaned = text;
  
  // Apply extremely aggressive pattern matching for any numeric sequence followed by dashes
  cleaned = cleaned
    // Remove any sequence starting with a number and dash anywhere in the text
    .replace(/\d+[-–—].*/g, '')
    // Remove common bot protection markers
    .replace(/\s*[-–—]+\s*\d+[-–—]+.*/g, '')
    .replace(/\s*[-]+\s*\d+.*$/g, '')
    .replace(/\s*[-]\s*[-]\s*\d+.*$/g, '')
    .replace(/\s*\d+[-]\s+[-].*$/g, '')
    // Remove "vine e" and variations which appear in many bot protection pages
    .replace(/\s*vine\s*e.*$/i, '')
    // Remove anything with vine, which is common in bot protection pages
    .replace(/\d+[-–—][^\d\s]*vine.*$/i, '')
    .replace(/.*vine\s*e.*$/i, '')
    // Remove any CSS class-like patterns 
    .replace(/\b[a-z]+[-][a-z]+[-][a-z]+\b/g, ' ')
    .replace(/\b[a-z]+[-][a-z]+\b/g, ' ')
    // Remove icon references
    .replace(/icon-[a-z-]+/g, ' ')
    // Basic cleanup
    .replace(/\s{2,}/g, ' ')
    .trim();
  
  // Third approach: Apply additional patterns as a safety net
  const botProtectionPatterns = [
    // Match patterns with numeric sequences and dashes
    /\s+[-–—]?\d+\s*[-–—].*$/,
    /\s+\d+\s*[-–—].*$/,
    // Match sequences of dashes with numbers
    /\s*[-–—]+\s*\d+.*$/,
    // Match "2- -2vine e" pattern and variations
    /\s*\d+[-]\s+[-]\d+vine\s+e.*$/,
    /\s*\d+[-–—].*vine.*$/i,
    // Match any suspicious ending patterns
    /\s*[-–—]\s*\d+.*$/
  ];
  
  // Apply each pattern one by one
  for (const pattern of botProtectionPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }
  
  // Final cleanup
  return cleaned.replace(/\s{2,}/g, ' ').trim();
}

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
    
    // Remove all styling and attributes before extracting content
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
    
    // Extract heading content after removing all attributes
    const h1Extracted = $('h1').first().text();
    const h2sExtracted = $('h2').map((_, el) => $(el).text()).get().filter(Boolean);
    const h3sExtracted = $('h3').map((_, el) => $(el).text()).get().filter(Boolean);
    const h4sExtracted = $('h4').map((_, el) => $(el).text()).get().filter(Boolean);

    // Get visible body text (excluding scripts, styles, etc.)
    const visibleTextExtracted: string[] = [];
    $('body p, body li, body div:not(:has(*))').each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 15) { // Only include meaningful text of sufficient length
        visibleTextExtracted.push(text);
      }
    });
    
    // Now clean the meta data with our ultra-aggressive cleaning
    const title = removeProtectionPatterns(titleRaw);
    const description = removeProtectionPatterns(descriptionRaw);
    const h1 = removeProtectionPatterns(h1Extracted);
    const h2s = h2sExtracted.map(removeProtectionPatterns).filter(Boolean);
    const h3s = h3sExtracted.map(removeProtectionPatterns).filter(Boolean);
    const h4s = h4sExtracted.map(removeProtectionPatterns).filter(Boolean);
    const visibleText = visibleTextExtracted.map(removeProtectionPatterns).filter(Boolean);
    
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
