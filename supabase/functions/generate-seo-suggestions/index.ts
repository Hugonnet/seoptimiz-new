import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentTitle, currentDescription, currentH1, currentH2s, currentH3s, currentH4s } = await req.json();
    
    console.log('Données reçues pour analyse:', {
      currentTitle,
      currentDescription,
      currentH1,
      currentH2s,
      currentH3s,
      currentH4s
    });

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
            content: `Tu es un expert SEO de haut niveau spécialisé dans l'optimisation des contenus web. 
            Ta mission est d'analyser et d'optimiser la structure SEO des pages web pour maximiser leur visibilité sur Google.
            
            Directives importantes :
            - Fournis des suggestions significativement différentes des contenus actuels
            - Optimise pour les mots-clés pertinents tout en gardant un langage naturel
            - Respecte les bonnes pratiques SEO 2024 de Google
            - Assure-toi que les suggestions sont plus percutantes et optimisées que les versions actuelles
            - Évite les répétitions entre les différents niveaux de titres
            - Limite la longueur du titre à 60 caractères et la description à 155 caractères`
          },
          {
            role: 'user',
            content: `Analyse et optimise les éléments SEO suivants :
            
            Titre actuel : "${currentTitle}"
            Description actuelle : "${currentDescription}"
            H1 actuel : "${currentH1}"
            H2s actuels : "${currentH2s?.join('", "')}"
            H3s actuels : "${currentH3s?.join('", "')}"
            H4s actuels : "${currentH4s?.join('", "')}"
            
            Fournis des suggestions optimisées pour chaque élément.`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur OpenAI: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Réponse brute OpenAI:', data);

    const suggestions = data.choices[0].message.content;
    console.log('Suggestions générées:', suggestions);

    // Parser les suggestions
    const parseSuggestions = (text: string) => {
      const result: any = {};
      
      if (text.includes('Titre suggéré :')) {
        result.suggested_title = text.match(/Titre suggéré : "(.*?)"/)?.[1];
      }
      if (text.includes('Description suggérée :')) {
        result.suggested_description = text.match(/Description suggérée : "(.*?)"/)?.[1];
      }
      if (text.includes('H1 suggéré :')) {
        result.suggested_h1 = text.match(/H1 suggéré : "(.*?)"/)?.[1];
      }
      
      // Parser les H2s
      const h2Matches = text.match(/H2s suggérés :([\s\S]*?)(?=\n\n|$)/);
      if (h2Matches) {
        result.suggested_h2s = h2Matches[1]
          .split('\n')
          .map(line => line.match(/- "(.*?)"/)?.[1])
          .filter(Boolean);
      }
      
      // Parser les H3s
      const h3Matches = text.match(/H3s suggérés :([\s\S]*?)(?=\n\n|$)/);
      if (h3Matches) {
        result.suggested_h3s = h3Matches[1]
          .split('\n')
          .map(line => line.match(/- "(.*?)"/)?.[1])
          .filter(Boolean);
      }
      
      // Parser les H4s
      const h4Matches = text.match(/H4s suggérés :([\s\S]*?)(?=\n\n|$)/);
      if (h4Matches) {
        result.suggested_h4s = h4Matches[1]
          .split('\n')
          .map(line => line.match(/- "(.*?)"/)?.[1])
          .filter(Boolean);
      }

      return result;
    };

    const parsedSuggestions = parseSuggestions(suggestions);
    console.log('Suggestions parsées:', parsedSuggestions);

    return new Response(JSON.stringify(parsedSuggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erreur dans generate-seo-suggestions:', error);
    return new Response(
      JSON.stringify({ error: `Erreur lors de la génération des suggestions: ${error.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});