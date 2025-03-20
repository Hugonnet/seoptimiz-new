
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
  
  // Replace patterns associated with bot protection mechanisms
  let cleaned = text;
  
  // First pass - remove specific numeric patterns that appear in bot protection
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
    .replace(/\s+\d+[-]\s+[-]\d+vine\s+e$/g, '');

  // Second pass - remove more generic patterns
  cleaned = cleaned
    // Handle more patterns of bot protection
    .replace(/\d+[-]\s+[-]?\d*vine\s?e\b/g, '')
    .replace(/\d+-\s*-\d*vine\s*e\b/g, '')
    // Broader pattern to catch number-dash-number variations with optional "vine e" suffix
    .replace(/\d+\s*-\s*(-)?(\d*)?v?i?n?e?\s*e?\b/g, '')
    // Even more aggressive pattern to remove anything that looks like bot protection
    .replace(/\d+[-].*?v?i?n?e?\s*e?$/g, '')
    // Try a very aggressive approach to remove anything after a number-dash pattern at the end
    .replace(/\s+\d+[-].*$/g, '');
    
  // Third pass - general cleanup of formatting and specific patterns
  cleaned = cleaned
    // Remove CSS-like class patterns
    .replace(/\b[a-z]+[-][a-z]+[-][a-z]+\b/g, ' ')
    .replace(/\b[a-z]+[-][a-z]+\b/g, ' ')
    // Remove specific patterns identified in the data
    .replace(/account|android|arrow|cart|menu|categories|chevron|opening/g, ' ')
    .replace(/circle|tinder|trello|tripadvisor|tumblr|twitch|twitter|viber|vimeo|vk/g, ' ')
    .replace(/ontakt|website|wechat|whatsapp|windows|wishlist|xing|yelp|youtube|zoom/g, ' ')
    // Remove icon patterns
    .replace(/icon-[a-z-]+/g, ' ')
    // Remove long sequences of dashes that often appear in corrupted content
    .replace(/[-]{2,}/g, ' ')
    // Remove any remaining dash sequences that look like formatting artifacts
    .replace(/(\s-\s-\s-)+/g, ' ')
    .replace(/(\s-\s)+/g, ' ')
    // Clean up repeating hyphens (common in malformed titles)
    .replace(/(?:- ){2,}/g, '')
    // Clean up extra spaces
    .replace(/\s{2,}/g, ' ')
    .trim();
  
  // Final extreme cleaning pass - find and remove anything that resembles a bot protection pattern
  // This is a catch-all for anything we missed
  cleaned = cleaned
    // Handle numeric patterns at the end that might be part of bot protection
    .replace(/\s+\d+\s*-.*$/g, '') 
    .replace(/\s+\d+[-–—](?:\s*\d*)?(?:[-–—]\d*)?[-–—]?(?:[a-z]*\s*[a-z])?$/i, '')
    // Very aggressive - remove any sequence with numbers and dashes near the end
    .replace(/\s+[-–—]?\d+[-–—](?:.*)?$/g, '')
    .replace(/\s*\d+[-–—]\s*(?:[-–—]?\d*)?(?:[-–—]?\w*)?$/g, '')
    // Remove anything that looks like a numeric code at the end
    .replace(/\s+[-–—]?\d+.*$/g, '')
    .trim();
    
  // Even more extreme - if we still have suspicious content, use this as a last resort  
  if (/\d+[-–—]/.test(cleaned) || /[-–—]\d+/.test(cleaned) || /\s+\d+\s+[-–—]/.test(cleaned)) {
    // If any suspicious patterns remain, try to extract just the first part before any numeric/dash pattern
    const parts = cleaned.split(/\s+\d+[-–—]|\s+[-–—]\d+/);
    if (parts.length > 0) {
      cleaned = parts[0].trim();
    }
  }
  
  // Then escape for CSV
  return cleaned.replace(/"/g, '""').replace(/[\r\n]+/g, ' ');
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
      seoData.title = cleanCSVText(seoData.title);
      seoData.description = cleanCSVText(seoData.description);
      seoData.h1 = cleanCSVText(seoData.h1);
      
      // Clean arrays if they exist
      if (seoData.h2s && Array.isArray(seoData.h2s)) {
        seoData.h2s = seoData.h2s.map(cleanCSVText).filter(Boolean);
      }
      if (seoData.h3s && Array.isArray(seoData.h3s)) {
        seoData.h3s = seoData.h3s.map(cleanCSVText).filter(Boolean);
      }
      if (seoData.h4s && Array.isArray(seoData.h4s)) {
        seoData.h4s = seoData.h4s.map(cleanCSVText).filter(Boolean);
      }
      if (seoData.visibleText && Array.isArray(seoData.visibleText)) {
        seoData.visibleText = seoData.visibleText.map(cleanCSVText).filter(Boolean);
      }
    }

    return seoData;
  } catch (error) {
    console.error('Erreur lors de l\'extraction des métadonnées:', error);
    throw error;
  }
};
