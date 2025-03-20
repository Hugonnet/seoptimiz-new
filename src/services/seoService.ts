
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

// New ultra-aggressive function to completely strip out bot protection patterns
export const removeProtectionPatterns = (text: string | null | undefined): string => {
  if (!text) return '';
  
  // Get first meaningful part before any suspicious patterns
  // This is the most aggressive approach - get only what's before the first numeric pattern
  const parts = text.split(/\s+\d+\s*[-–]/);
  if (parts.length > 1) {
    // Take only the first part if we found a split pattern
    return parts[0].trim();
  }
  
  // If no numeric-dash pattern, try cleaning with patterns
  let cleaned = text;
  
  // Extremely aggressive pattern matching for any numeric sequence followed by dashes
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
    // Basic cleanup
    .replace(/\s{2,}/g, ' ')
    .trim();
  
  // Apply additional aggressive cleaning using regex patterns
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
  
  // Final trim and space normalization
  return cleaned.replace(/\s{2,}/g, ' ').trim();
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
