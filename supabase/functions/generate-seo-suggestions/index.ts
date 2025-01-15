import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.1.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { currentTitle, currentDescription, currentH1, currentH2s, currentH3s, currentH4s, visibleText } = await req.json();

    // Calculer les métriques avancées
    const readabilityScore = calculateReadabilityScore(visibleText);
    const contentLength = calculateContentLength(visibleText);
    const { internalLinks, externalLinks, brokenLinks } = await analyzeLinks(visibleText);
    const imageAlts = await analyzeImageAlts(visibleText);
    const pageLoadSpeed = await measurePageLoadSpeed();

    // Configuration OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });
    const openai = new OpenAIApi(configuration);

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Generate SEO suggestions based on the following data:\nTitle: ${currentTitle}\nDescription: ${currentDescription}\nH1: ${currentH1}\nH2s: ${currentH2s.join(', ')}\nH3s: ${currentH3s.join(', ')}\nH4s: ${currentH4s.join(', ')}\nVisible Text: ${visibleText.join(' ')}`,
      max_tokens: 150,
    });

    const suggestedTitle = response.data.choices[0].text.trim();
    const suggestedDescription = response.data.choices[0].text.trim();
    const suggestedH1 = response.data.choices[0].text.trim();
    const suggestedH2s = response.data.choices[0].text.trim().split(', ');
    const suggestedH3s = response.data.choices[0].text.trim().split(', ');
    const suggestedH4s = response.data.choices[0].text.trim().split(', ');
    const titleContext = "Context for title";
    const descriptionContext = "Context for description";
    const h1Context = "Context for H1";
    const h2sContext = ["Context for H2"];
    const h3sContext = ["Context for H3"];
    const h4sContext = ["Context for H4"];

    const finalResponse = {
      suggested_title: suggestedTitle,
      suggested_description: suggestedDescription,
      suggested_h1: suggestedH1,
      suggested_h2s: suggestedH2s,
      suggested_h3s: suggestedH3s,
      suggested_h4s: suggestedH4s,
      title_context: titleContext,
      description_context: descriptionContext,
      h1_context: h1Context,
      h2s_context: h2sContext,
      h3s_context: h3sContext,
      h4s_context: h4sContext,
      readability_score: readabilityScore || 75, // Valeur par défaut pour le test
      content_length: contentLength || visibleText.length,
      internal_links: internalLinks || [],
      external_links: externalLinks || [],
      broken_links: brokenLinks || [],
      image_alts: imageAlts || {},
      page_load_speed: pageLoadSpeed || 2.5,
      mobile_friendly: true,
    };

    return new Response(JSON.stringify(finalResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Fonctions utilitaires pour les métriques
function calculateReadabilityScore(text: string[]): number {
  // Implémentation simple pour le test
  return 75;
}

function calculateContentLength(text: string[]): number {
  return text.join(' ').split(/\s+/).length;
}

async function analyzeLinks(text: string[]): Promise<{
  internalLinks: string[];
  externalLinks: string[];
  brokenLinks: string[];
}> {
  // Implémentation simple pour le test
  return {
    internalLinks: [],
    externalLinks: [],
    brokenLinks: [],
  };
}

async function analyzeImageAlts(text: string[]): Promise<Record<string, string>> {
  // Implémentation simple pour le test
  return {};
}

async function measurePageLoadSpeed(): Promise<number> {
  // Implémentation simple pour le test
  return 2.5;
}
