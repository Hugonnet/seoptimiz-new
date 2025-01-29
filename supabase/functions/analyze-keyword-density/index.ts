import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface KeywordDensity {
  keyword: string;
  count: number;
  density: number;
}

// Liste étendue de mots à exclure
const stopWords = new Set([
  // Auxiliaires être et avoir
  'suis', 'es', 'est', 'sommes', 'êtes', 'sont', 'étais', 'était', 'étions', 'étiez', 'étaient',
  'serai', 'seras', 'sera', 'serons', 'serez', 'seront', 'été',
  'ai', 'as', 'a', 'avons', 'avez', 'ont', 'avais', 'avait', 'avions', 'aviez', 'avaient',
  'aurai', 'auras', 'aura', 'aurons', 'aurez', 'auront', 'eu',
  
  // Pronoms
  'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'me', 'te', 'se', 'le', 'la', 'les',
  'lui', 'leur', 'y', 'en', 'ce', 'celui', 'celle', 'ceux', 'celles', 'mon', 'ton', 'son',
  'notre', 'votre', 'leur', 'mes', 'tes', 'ses', 'nos', 'vos', 'leurs',
  
  // Adverbes communs
  'très', 'bien', 'plus', 'moins', 'peu', 'trop', 'assez', 'beaucoup', 'encore', 'toujours',
  'jamais', 'souvent', 'parfois', 'maintenant', 'aujourd', 'hier', 'demain', 'déjà', 'ici',
  'là', 'ailleurs', 'partout', 'notamment', 'certainement', 'probablement', 'peut-être',
  
  // Articles et prépositions
  'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'à', 'au', 'aux', 'dans', 'sur', 'sous',
  'avec', 'sans', 'pour', 'par', 'en', 'vers', 'chez', 'depuis', 'pendant', 'avant', 'après',
  
  // Mots WordPress courants à exclure
  'wordpress', 'wp', 'admin', 'user', 'post', 'page', 'comment', 'menu', 'widget', 'plugin',
  'theme', 'category', 'tag', 'author', 'editor', 'subscriber', 'administrator',
  
  // Conjonctions
  'et', 'ou', 'mais', 'donc', 'car', 'ni', 'or', 'que', 'qui', 'quoi', 'dont', 'où',
  'comment', 'pourquoi', 'quand', 'si'
]);

// Fonction pour vérifier si une chaîne contient une date
function containsDate(str: string): boolean {
  // Vérifie les formats de date courants (ex: 2024, 24/01, 24/01/2024, janvier 2024, etc.)
  const datePatterns = [
    /\d{4}/,  // Année
    /\d{1,2}\/\d{1,2}/,  // JJ/MM
    /\d{1,2}\/\d{1,2}\/\d{2,4}/,  // JJ/MM/AAAA
    /(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4}/i,  // Mois AAAA
    /\d{1,2}\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/i  // JJ Mois
  ];
  
  return datePatterns.some(pattern => pattern.test(str));
}

// Fonction pour vérifier si un mot est probablement un nom propre
function isLikelyProperNoun(word: string): boolean {
  // Vérifie si le mot commence par une majuscule et n'est pas en début de phrase
  return /^[A-Z][a-zà-ÿ]+/.test(word) && word.length > 1;
}

function getBigrams(words: string[]): string[] {
  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    const word1 = words[i].toLowerCase();
    const word2 = words[i + 1].toLowerCase();
    
    // Vérifie que les deux mots ne sont pas des stop words et ont plus de 3 caractères
    if (!stopWords.has(word1) && !stopWords.has(word2) && 
        word1.length > 3 && word2.length > 3 &&
        !containsDate(word1) && !containsDate(word2) &&
        !isLikelyProperNoun(words[i]) && !isLikelyProperNoun(words[i + 1])) {
      bigrams.push(`${word1} ${word2}`);
    }
  }
  return bigrams;
}

serve(async (req) => {
  console.log("Function invoked with request:", req.method);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json();
    console.log("Received URL to analyze:", url);

    if (!url) {
      throw new Error('URL is required');
    }

    console.log("Fetching content from URL:", url);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log("Successfully fetched HTML content, length:", html.length);

    // Nettoyage du texte
    const visibleText = html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const words = visibleText.split(/\s+/);
    const totalWords = words.length;
    console.log("Total words found:", totalWords);

    // Analyse des bigrammes
    const bigrams = getBigrams(words);
    const bigramFrequency: { [key: string]: number } = {};
    bigrams.forEach(bigram => {
      bigramFrequency[bigram] = (bigramFrequency[bigram] || 0) + 1;
    });

    // Analyse des mots simples avec filtrage
    const wordFrequency: { [key: string]: number } = {};
    words.forEach(word => {
      const normalizedWord = word.toLowerCase();
      if (word.length > 3 && 
          !stopWords.has(normalizedWord) && 
          !containsDate(normalizedWord) &&
          !isLikelyProperNoun(word)) {
        wordFrequency[normalizedWord] = (wordFrequency[normalizedWord] || 0) + 1;
      }
    });

    // Combine et trie les résultats
    const bigramDensity: KeywordDensity[] = Object.entries(bigramFrequency)
      .map(([keyword, count]) => ({
        keyword,
        count,
        density: (count / (totalWords - 1)) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const singleWordDensity: KeywordDensity[] = Object.entries(wordFrequency)
      .map(([keyword, count]) => ({
        keyword,
        count,
        density: (count / totalWords) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    const keywordDensity = [...bigramDensity, ...singleWordDensity];

    console.log("Analysis complete, returning results");

    return new Response(
      JSON.stringify({
        keywordDensity,
        totalWords
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    )
  } catch (error) {
    console.error("Error in analyze-keyword-density:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      },
    )
  }
});