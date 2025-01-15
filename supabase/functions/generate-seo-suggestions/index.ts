import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.1.0';

const openAIConfig = new Configuration({
  apiKey: Deno.env.get('OPENAI_API_KEY')
});
const openai = new OpenAIApi(openAIConfig);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SEOData {
  currentTitle?: string;
  currentDescription?: string;
  currentH1?: string;
  currentH2s?: string[];
  currentH3s?: string[];
  currentH4s?: string[];
  visibleText?: string[];
  url: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, currentTitle, currentDescription, currentH1, currentH2s, currentH3s, currentH4s, visibleText } = await req.json() as SEOData;

    // Analyze internal and external links
    const internalLinks = await analyzeInternalLinks(url, visibleText?.join(' ') || '');
    const externalLinks = await analyzeExternalLinks(url, visibleText?.join(' ') || '');
    const brokenLinks = await analyzeBrokenLinks([...internalLinks, ...externalLinks]);

    // Analyze images and their alt texts
    const imageAlts = await analyzeImageAlts(visibleText?.join(' ') || '');

    // Calculate readability metrics
    const readabilityScore = calculateReadabilityScore(visibleText || []);
    const contentLength = calculateContentLength(visibleText || []);

    // Generate SEO suggestions using GPT-4
    const suggestions = await generateSEOSuggestions({
      title: currentTitle,
      description: currentDescription,
      h1: currentH1,
      h2s: currentH2s,
      url,
    });

    // Simulate page load speed (based on content size and complexity)
    const pageLoadSpeed = calculatePageLoadSpeed(contentLength, internalLinks.length + externalLinks.length);

    // Check mobile friendliness based on content structure
    const mobileFriendly = checkMobileFriendliness(visibleText || []);

    return new Response(
      JSON.stringify({
        ...suggestions,
        readability_score: readabilityScore,
        content_length: contentLength,
        internal_links: internalLinks,
        external_links: externalLinks,
        broken_links: brokenLinks,
        image_alts: imageAlts,
        page_load_speed: pageLoadSpeed,
        mobile_friendly: mobileFriendly,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error generating SEO suggestions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});

async function generateSEOSuggestions({ title, description, h1, h2s, url }: {
  title?: string;
  description?: string;
  h1?: string;
  h2s?: string[];
  url: string;
}) {
  // Generate title suggestion
  const titlePrompt = `En tant qu'expert SEO, analyse ce titre de page web : "${title}" pour le site ${url}.
  Propose un nouveau titre optimisé qui :
  - Conserve les mots-clés importants
  - A une longueur idéale (50-60 caractères)
  - Est accrocheur et pertinent
  - Inclut si possible le nom de la marque
  Réponds uniquement avec le titre optimisé, sans explications.`;

  const titleCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: titlePrompt }]
  });

  const suggestedTitle = titleCompletion.data.choices[0]?.message?.content || '';

  // Generate title context
  const titleContextPrompt = `Explique brièvement pourquoi ce nouveau titre "${suggestedTitle}" est meilleur que l'original "${title}" en termes de SEO.`;

  const titleContextCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: titleContextPrompt }]
  });

  const titleContext = titleContextCompletion.data.choices[0]?.message?.content || '';

  // Generate description suggestion
  const descriptionPrompt = `En tant qu'expert SEO, analyse cette meta description : "${description}" pour le site ${url}.
  Propose une nouvelle description qui :
  - Résume clairement le contenu de la page
  - Inclut les mots-clés principaux naturellement
  - Est engageante avec un call-to-action
  - Fait entre 150-160 caractères
  Réponds uniquement avec la description optimisée, sans explications.`;

  const descriptionCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: descriptionPrompt }]
  });

  const suggestedDescription = descriptionCompletion.data.choices[0]?.message?.content || '';

  // Generate description context
  const descriptionContextPrompt = `Explique brièvement pourquoi cette nouvelle meta description "${suggestedDescription}" est meilleure que l'originale "${description}" en termes de SEO.`;

  const descriptionContextCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: descriptionContextPrompt }]
  });

  const descriptionContext = descriptionContextCompletion.data.choices[0]?.message?.content || '';

  // Generate H1 suggestion
  const h1Prompt = `En tant qu'expert SEO, analyse ce H1 : "${h1}" pour le site ${url}.
  Propose un nouveau H1 qui :
  - Reflète précisément le contenu principal
  - Inclut le mot-clé principal naturellement
  - Est accrocheur et informatif
  - A une longueur optimale (20-70 caractères)
  Réponds uniquement avec le H1 optimisé, sans explications.`;

  const h1Completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: h1Prompt }]
  });

  const suggestedH1 = h1Completion.data.choices[0]?.message?.content || '';

  // Generate H1 context
  const h1ContextPrompt = `Explique brièvement pourquoi ce nouveau H1 "${suggestedH1}" est meilleur que l'original "${h1}" en termes de SEO.`;

  const h1ContextCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: h1ContextPrompt }]
  });

  const h1Context = h1ContextCompletion.data.choices[0]?.message?.content || '';

  // Generate H2s suggestions
  const suggestedH2s = await Promise.all(
    h2s.map(async (h2) => {
      const h2Prompt = `En tant qu'expert SEO, analyse ce H2 : "${h2}" pour le site ${url}.
      Propose un nouveau H2 qui :
      - Structure clairement la section
      - Utilise des mots-clés secondaires pertinents
      - Est informatif et engageant
      Réponds uniquement avec le H2 optimisé, sans explications.`;

      const h2Completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: h2Prompt }]
      });

      return h2Completion.data.choices[0]?.message?.content || h2;
    })
  );

  // Generate H2s context
  const h2sContextPrompt = `Explique brièvement pourquoi la nouvelle structure des H2 est meilleure en termes de SEO et de hiérarchie de contenu.
  Originaux : ${h2s.join(' | ')}
  Optimisés : ${suggestedH2s.join(' | ')}`;

  const h2sContextCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: h2sContextPrompt }]
  });

  const h2sContext = h2sContextCompletion.data.choices[0]?.message?.content || '';

  return {
    suggested_title: suggestedTitle,
    suggested_description: suggestedDescription,
    suggested_h1: suggestedH1,
    suggested_h2s: suggestedH2s,
    title_context: titleContext,
    description_context: descriptionContext,
    h1_context: h1Context,
    h2s_context: h2sContext,
  };
}

async function analyzeInternalLinks(baseUrl: string, content: string): Promise<string[]> {
  const urlObj = new URL(baseUrl);
  const domain = urlObj.hostname;
  
  // Extract URLs from content using regex
  const urlRegex = /https?:\/\/[^\s<>"]+/g;
  const allUrls = content.match(urlRegex) || [];
  
  return allUrls.filter(url => url.includes(domain));
}

async function analyzeExternalLinks(baseUrl: string, content: string): Promise<string[]> {
  const urlObj = new URL(baseUrl);
  const domain = urlObj.hostname;
  
  const urlRegex = /https?:\/\/[^\s<>"]+/g;
  const allUrls = content.match(urlRegex) || [];
  
  return allUrls.filter(url => !url.includes(domain));
}

async function analyzeBrokenLinks(urls: string[]): Promise<string[]> {
  const brokenLinks: string[] = [];
  
  for (const url of urls) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.status >= 400) {
        brokenLinks.push(url);
      }
    } catch {
      brokenLinks.push(url);
    }
  }
  
  return brokenLinks;
}

async function analyzeImageAlts(content: string): Promise<Record<string, string>> {
  const imgRegex = /<img[^>]+alt=["']([^"']+)["'][^>]*>/g;
  const imageAlts: Record<string, string> = {};
  let match;
  
  while ((match = imgRegex.exec(content)) !== null) {
    const srcRegex = /src=["']([^"']+)["']/;
    const srcMatch = match[0].match(srcRegex);
    if (srcMatch) {
      imageAlts[srcMatch[1]] = match[1];
    }
  }
  
  return imageAlts;
}

function calculateReadabilityScore(text: string[]): number {
  const content = text.join(' ');
  const words = content.split(/\s+/).length;
  const sentences = content.split(/[.!?]+/).length;
  const characters = content.replace(/\s+/g, '').length;
  
  // Flesch Reading Ease Score calculation
  const averageWordsPerSentence = words / sentences;
  const averageCharactersPerWord = characters / words;
  
  let score = 206.835 - (1.015 * averageWordsPerSentence) - (84.6 * averageCharactersPerWord);
  score = Math.min(100, Math.max(0, score));
  
  return Math.round(score);
}

function calculateContentLength(text: string[]): number {
  return text.join(' ').split(/\s+/).length;
}

function calculatePageLoadSpeed(contentLength: number, totalLinks: number): number {
  // Simulate page load speed based on content size and complexity
  const baseLoadTime = 0.5; // Base load time in seconds
  const contentFactor = contentLength / 1000; // Factor based on content length
  const linksFactor = totalLinks * 0.05; // Factor based on number of links
  
  const loadTime = baseLoadTime + contentFactor + linksFactor;
  return Math.round(loadTime * 10) / 10; // Round to 1 decimal place
}

function checkMobileFriendliness(text: string[]): boolean {
  const content = text.join(' ');
  
  // Check for potential mobile-unfriendly characteristics
  const hasLongParagraphs = content.split('\n').some(p => p.split(/\s+/).length > 100);
  const hasLargeImages = content.includes('width="') || content.includes('height="');
  const hasHorizontalScroll = content.includes('overflow-x:') || content.includes('overflow: scroll');
  
  return !hasLongParagraphs && !hasLargeImages && !hasHorizontalScroll;
}
