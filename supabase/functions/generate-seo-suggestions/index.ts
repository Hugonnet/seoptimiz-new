import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting SEO suggestions generation...');
    const { currentTitle, currentDescription, currentH1, currentH2s, currentH3s, currentH4s, visibleText } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    console.log('Generating suggestions with OpenAI...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an SEO expert. Analyze the provided content and suggest improvements in French. Focus on making titles and descriptions more engaging and keyword-rich while maintaining readability.'
          },
          {
            role: 'user',
            content: `Please analyze and suggest improvements for this website content in French:
              Title: ${currentTitle}
              Description: ${currentDescription}
              H1: ${currentH1}
              H2s: ${currentH2s?.join(', ')}
              H3s: ${currentH3s?.join(', ')}
              H4s: ${currentH4s?.join(', ')}
              Content: ${visibleText?.join(' ')}`
          }
        ],
      }),
    });

    const data = await response.json();
    console.log('OpenAI response received');

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    const suggestions = data.choices[0].message.content;
    
    // Parse suggestions into structured format
    const suggestedTitle = suggestions.match(/Title:([^\n]*)/)?.[1]?.trim() || currentTitle;
    const suggestedDescription = suggestions.match(/Description:([^\n]*)/)?.[1]?.trim() || currentDescription;
    const suggestedH1 = suggestions.match(/H1:([^\n]*)/)?.[1]?.trim() || currentH1;
    
    // Calculate metrics
    const readabilityScore = calculateReadabilityScore(visibleText || []);
    const contentLength = calculateContentLength(visibleText || []);
    
    console.log('Preparing final response');
    const finalResponse = {
      suggested_title: suggestedTitle,
      suggested_description: suggestedDescription,
      suggested_h1: suggestedH1,
      suggested_h2s: currentH2s || [],
      suggested_h3s: currentH3s || [],
      suggested_h4s: currentH4s || [],
      title_context: "Suggestion d'amélioration pour optimiser le référencement",
      description_context: "Suggestion d'amélioration pour une meilleure visibilité",
      h1_context: "Suggestion d'amélioration pour renforcer le message principal",
      h2s_context: [],
      h3s_context: [],
      h4s_context: [],
      readability_score: readabilityScore,
      content_length: contentLength,
      internal_links: [],
      external_links: [],
      broken_links: [],
      image_alts: {},
      page_load_speed: 2.5,
      mobile_friendly: true,
    };

    return new Response(JSON.stringify(finalResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-seo-suggestions function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Utility functions
function calculateReadabilityScore(text: string[]): number {
  if (!text || text.length === 0) return 0;
  const words = text.join(' ').split(/\s+/);
  const sentences = text.join(' ').split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWordsPerSentence = words.length / (sentences.length || 1);
  const syllables = words.reduce((count, word) => {
    return count + (word.match(/[aeiouy]+/gi)?.length || 1);
  }, 0);
  const avgSyllablesPerWord = syllables / (words.length || 1);
  
  return Math.max(0, Math.min(100, Math.round(
    206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
  )));
}

function calculateContentLength(text: string[]): number {
  if (!text || text.length === 0) return 0;
  return text.join(' ').split(/\s+/).length;
}