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
  // Préparer les en-têtes
  const headers = [
    'URL',
    'Date d\'analyse',
    'Titre actuel',
    'Titre suggéré',
    'Description actuelle',
    'Description suggérée',
    'H1 actuel',
    'H1 suggéré',
    'H2s actuels',
    'H2s suggérés',
    'H3s actuels',
    'H3s suggérés',
    'H4s actuels',
    'H4s suggérés'
  ];

  // Préparer les lignes de données
  const rows = data.map(item => {
    const formatArray = (arr: string[] | null) => arr ? arr.join(' | ') : '';
    
    return [
      item.url,
      new Date(item.created_at).toLocaleDateString('fr-FR'),
      item.current_title || '',
      item.suggested_title || '',
      item.current_description || '',
      item.suggested_description || '',
      item.current_h1 || '',
      item.suggested_h1 || '',
      formatArray(item.current_h2s),
      formatArray(item.suggested_h2s),
      formatArray(item.current_h3s),
      formatArray(item.suggested_h3s),
      formatArray(item.current_h4s),
      formatArray(item.suggested_h4s)
    ];
  });

  // Convertir en format CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => {
        // Échapper les virgules et les guillemets dans les cellules
        const escaped = cell.toString().replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    )
  ].join('\n');

  // Créer et télécharger le fichier
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const date = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-');
  link.href = URL.createObjectURL(blob);
  link.download = `analyse-seo-${date}.csv`;
  link.click();
};