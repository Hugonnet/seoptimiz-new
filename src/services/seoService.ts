import { supabase } from '@/integrations/supabase/client';

export interface SEOMetadata {
  title: string;
  description: string;
  h1: string;
  h2s: string[];
  h3s: string[];
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export const extractSEOMetadata = async (url: string): Promise<SEOMetadata> => {
  console.log('Starting SEO analysis for URL:', url);
  
  try {
    const { data, error } = await supabase.functions.invoke('extract-seo', {
      body: { url },
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(`Erreur lors de l'appel à la fonction Edge: ${error.message}`);
    }

    if (!data) {
      throw new Error('Aucune donnée reçue de la fonction Edge');
    }

    console.log('Edge function response:', data);
    return data as SEOMetadata;
  } catch (error) {
    console.error('Error in extractSEOMetadata:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    throw error;
  }
};

export const downloadTableAsCSV = (data: any[]) => {
  const headers = [
    'URL',
    'Titre Actuel',
    'Titre Suggéré',
    'Description Actuelle',
    'Description Suggérée',
    'H1 Actuel',
    'H1 Suggéré',
    'Statut',
    'Commentaires IA',
    'Date'
  ];

  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      row.url,
      row.currentTitle,
      row.suggestedTitle,
      row.currentDescription,
      row.suggestedDescription,
      row.currentH1,
      row.suggestedH1,
      row.optimizationStatus,
      row.aiComments,
      row.date
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'seo_analysis.csv';
  link.click();
};
