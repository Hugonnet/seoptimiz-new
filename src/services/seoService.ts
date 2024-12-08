export interface SEOMetadata {
  title: string;
  description: string;
  h1: string;
  h2s: string[];
  h3s: string[];
}

export const extractSEOMetadata = async (url: string): Promise<SEOMetadata> => {
  try {
    // Note: Cette fonction nécessite une API backend pour fonctionner
    // car le CORS empêche le scraping direct depuis le navigateur
    const response = await fetch(`/api/extract-metadata?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'extraction des métadonnées:', error);
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