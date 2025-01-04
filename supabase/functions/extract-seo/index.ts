import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { load } from "https://deno.land/x/cheerio@1.0.7/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    console.log('Analysing URL:', url);

    const response = await fetch(url);
    const html = await response.text();
    const $ = load(html);

    // Extraction des données
    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content');
    const h1 = $('h1').first().text();
    const h2s = $('h2').map((_, el) => $(el).text()).get();
    const h3s = $('h3').map((_, el) => $(el).text()).get();
    const h4s = $('h4').map((_, el) => $(el).text()).get();
    const visibleText = $('body').text().split(/\s+/).filter(Boolean);

    // Appel à l'API OpenAI pour générer des suggestions
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert SEO spécialisé dans l\'optimisation de contenu web. Analyse le contenu fourni et suggère des améliorations pour les balises meta et titres.'
          },
          {
            role: 'user',
            content: `Analyse ce contenu et suggère des améliorations SEO :
              Titre actuel : ${title || 'Non défini'}
              Description actuelle : ${description || 'Non définie'}
              H1 actuel : ${h1 || 'Non défini'}
              H2s actuels : ${h2s.join(' | ') || 'Non définis'}
              H3s actuels : ${h3s.join(' | ') || 'Non définis'}
              H4s actuels : ${h4s.join(' | ') || 'Non définis'}
              Texte visible : ${visibleText.slice(0, 200).join(' ')}
              
              IMPORTANT : Fournis TOUJOURS une suggestion de H1, même s'il n'y en a pas sur la page.
              Retourne uniquement un objet JSON avec cette structure :
              {
                "suggested_title": "titre optimisé",
                "title_context": "explication de l'optimisation du titre",
                "suggested_description": "description optimisée",
                "description_context": "explication de l'optimisation de la description",
                "suggested_h1": "H1 optimisé",
                "h1_context": "explication de l'optimisation du H1",
                "suggested_h2s": ["H2 optimisé 1", "H2 optimisé 2"],
                "h2s_context": ["explication H2 1", "explication H2 2"],
                "suggested_h3s": ["H3 optimisé 1", "H3 optimisé 2"],
                "h3s_context": ["explication H3 1", "explication H3 2"],
                "suggested_h4s": ["H4 optimisé 1", "H4 optimisé 2"],
                "h4s_context": ["explication H4 1", "explication H4 2"]
              }`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error('Erreur lors de la génération des suggestions');
    }

    const aiData = await openAIResponse.json();
    const suggestions = JSON.parse(aiData.choices[0].message.content);

    // Création de l'analyse dans la base de données
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: seoAnalysis, error: insertError } = await supabaseClient
      .from('seo_analyses')
      .insert({
        url,
        current_title: title || null,
        current_description: description || null,
        current_h1: h1 || null,
        current_h2s: h2s,
        current_h3s: h3s,
        current_h4s: h4s,
        suggested_title: suggestions.suggested_title,
        suggested_description: suggestions.suggested_description,
        suggested_h1: suggestions.suggested_h1,
        suggested_h2s: suggestions.suggested_h2s,
        suggested_h3s: suggestions.suggested_h3s,
        suggested_h4s: suggestions.suggested_h4s,
        visible_text: visibleText
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return new Response(JSON.stringify(seoAnalysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur:', error);
    return new Response(
      JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});