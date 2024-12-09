import { supabase } from '@/integrations/supabase/client';

export interface SEOMetadata {
  title: string;
  description: string;
  h1: string;
  h2s: string[];
  h3s: string[];
  h4s: string[];
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export const extractSEOMetadata = async (url: string): Promise<SEOMetadata> => {
  if (!url) {
    throw new Error("Veuillez entrer une URL valide");
  }

  console.log('Démarrage de l\'analyse SEO pour:', url);
  console.log('Envoi de la requête avec URL:', url);
  
  try {
    new URL(url);
  } catch (e) {
    throw new Error("Format d'URL invalide");
  }

  console.log('Appel de la fonction extract-seo avec:', { url });

  const { data, error } = await supabase.functions.invoke('extract-seo', {
    body: { url },
  });

  if (error) {
    console.error('Erreur lors de l\'analyse SEO:', error);
    throw new Error(error.message || "Impossible d'analyser cette URL pour le moment. Veuillez réessayer plus tard.");
  }

  if (!data) {
    throw new Error("Aucune donnée n'a été récupérée");
  }

  console.log('Données SEO extraites:', data);

  return data as SEOMetadata;
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
