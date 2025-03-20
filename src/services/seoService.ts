import { SEOAnalysis } from '@/store/seoStore';
import { supabase } from "@/integrations/supabase/client";

export interface SEOMetadata {
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
  isProtectedPage?: boolean;
}

// Enhanced helper function to clean text for CSV export and display
const cleanCSVText = (text: string | null | undefined): string => {
  if (!text) return '';
  
  // First, completely remove any bot protection patterns
  const cleanText = removeProtectionPatterns(text);
  
  // Then escape for CSV
  return cleanText.replace(/"/g, '""').replace(/[\r\n]+/g, ' ');
};

// Ultra-aggressive bot protection pattern removal
export const removeProtectionPatterns = (text: string | null | undefined): string => {
  if (!text) return '';
  
  // STAGE 1: Get first meaningful part before any suspicious patterns
  const numericSplit = text.split(/\s+\d+\s*[-–—]/);
  if (numericSplit.length > 1 && numericSplit[0].trim().length > 5) {
    return numericSplit[0].trim();
  }
  
  // STAGE 2: Apply pattern-based cleaning
  let cleaned = text;
  
  // Common bot protection signatures to completely remove
  const botSignatures = [
    'vine e',
    'cloudflare',
    'captcha',
    'browser check',
    'security check',
    'ddos',
    'bot verification',
    'human verification'
  ];
  
  // Check if any bot signatures exist in the text (case insensitive)
  const hasBotSignature = botSignatures.some(sig => 
    cleaned.toLowerCase().includes(sig.toLowerCase())
  );
  
  if (hasBotSignature) {
    // If we have a confirmed bot protection signature, use a more aggressive approach
    // Just keep the text before any numbers or special patterns
    const simpleParts = cleaned.split(/[0-9-–—]/);
    if (simpleParts.length > 0 && simpleParts[0].trim().length > 5) {
      return simpleParts[0].trim();
    }
  }
  
  // STAGE 3: Apply extremely aggressive pattern matching
  cleaned = cleaned
    // Remove any sequence with numbers and dashes anywhere in the text
    .replace(/\d+[-–—].*$/g, '')
    .replace(/.*\d+[-–—].*$/g, '')
    // Remove specific bot protection markers
    .replace(/\s*[-–—]+\s*\d+[-–—]+.*$/g, '')
    .replace(/\s*[-]+\s*\d+.*$/g, '')
    .replace(/\s*[-]\s*[-]\s*\d+.*$/g, '')
    .replace(/\s*\d+[-]\s+[-].*$/g, '')
    // Remove "vine e" patterns which are very common in bot protection
    .replace(/\s*vine\s*e.*$/i, '')
    .replace(/.*vine\s*e.*$/i, '')
    // Remove weird dash patterns
    .replace(/\s*[-–—]{2,}.*$/g, '')
    // Remove all digit-dash combinations
    .replace(/\d+[-–—][^\d\s]*.*$/g, '')
    // Basic cleanup
    .replace(/\s{2,}/g, ' ')
    .trim();
  
  // STAGE 4: Additional pattern cleaning with a comprehensive list of suspicious sequences
  const botProtectionPatterns = [
    // Match patterns with various numeric and dash combinations
    /\s+[-–—]?\d+\s*[-–—].*$/,
    /\s+\d+\s*[-–—].*$/,
    /\s*[-–—]+\s*\d+.*$/,
    /\s*\d+[-]\s+[-]\d+vine\s+e.*$/,
    /\s*\d+[-–—].*$/,
    // Remove any dashed word pattern that might be part of protection
    /\s*[-–—]\s*\w+\s*[-–—].*$/,
    // Match any dash followed by digits
    /\s*[-–—]\s*\d+.*$/
  ];
  
  // Apply each pattern one by one
  for (const pattern of botProtectionPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }
  
  // STAGE 5: Last resort method - if the cleaned text still has suspicious patterns
  // like multiple dashes or numeric sequences, just take the first part of the text
  if (/\d+[-–—]/.test(cleaned) || /[-–—]{2}/.test(cleaned)) {
    // Split by any dash or number
    const lastResortParts = cleaned.split(/[-–—0-9]/);
    if (lastResortParts.length > 0 && lastResortParts[0].trim().length > 5) {
      return lastResortParts[0].trim();
    }
  }
  
  // Final cleanup - normalize spaces
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
  
  return cleaned;
};

export const downloadTableAsCSV = (data: SEOAnalysis[]) => {
  if (!data || data.length === 0) return;

  const headers = [
    'URL',
    'Entreprise',
    'Titre actuel',
    'Description actuelle',
    'H1 actuel',
    'Titre suggéré',
    'Description suggérée',
    'H1 suggéré',
    'Vitesse de chargement'
  ];

  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      row.url,
      row.company || '',
      `"${cleanCSVText(row.current_title)}"`,
      `"${cleanCSVText(row.current_description)}"`,
      `"${cleanCSVText(row.current_h1)}"`,
      `"${cleanCSVText(row.suggested_title)}"`,
      `"${cleanCSVText(row.suggested_description)}"`,
      `"${cleanCSVText(row.suggested_h1)}"`,
      row.page_load_speed || ''
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `seo_analysis_${new Date().toISOString()}.csv`);
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const extractSEOMetadata = async (url: string): Promise<SEOMetadata> => {
  console.log('Extraction des métadonnées SEO pour:', url);
  
  try {
    const { data: seoData, error } = await supabase.functions.invoke('extract-seo', {
      body: { url }
    });

    if (error) {
      console.error('Erreur lors de l\'appel à extract-seo:', error);
      throw error;
    }

    // Clean the data right after receiving it from the extraction function
    if (seoData) {
      seoData.title = removeProtectionPatterns(seoData.title);
      seoData.description = removeProtectionPatterns(seoData.description);
      seoData.h1 = removeProtectionPatterns(seoData.h1);
      
      // Clean arrays if they exist
      if (seoData.h2s && Array.isArray(seoData.h2s)) {
        seoData.h2s = seoData.h2s.map(removeProtectionPatterns).filter(Boolean);
      }
      if (seoData.h3s && Array.isArray(seoData.h3s)) {
        seoData.h3s = seoData.h3s.map(removeProtectionPatterns).filter(Boolean);
      }
      if (seoData.h4s && Array.isArray(seoData.h4s)) {
        seoData.h4s = seoData.h4s.map(removeProtectionPatterns).filter(Boolean);
      }
      if (seoData.visibleText && Array.isArray(seoData.visibleText)) {
        seoData.visibleText = seoData.visibleText.map(removeProtectionPatterns).filter(Boolean);
      }
    }

    return seoData;
  } catch (error) {
    console.error('Erreur lors de l\'extraction des métadonnées:', error);
    throw error;
  }
};
