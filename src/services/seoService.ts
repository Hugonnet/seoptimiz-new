
import { SEOAnalysis } from '@/store/seoStore';

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
}

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
      `"${(row.current_title || '').replace(/"/g, '""')}"`,
      `"${(row.current_description || '').replace(/"/g, '""')}"`,
      `"${(row.current_h1 || '').replace(/"/g, '""')}"`,
      `"${(row.suggested_title || '').replace(/"/g, '""')}"`,
      `"${(row.suggested_description || '').replace(/"/g, '""')}"`,
      `"${(row.suggested_h1 || '').replace(/"/g, '""')}"`,
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
    // Utiliser une API ou un service backend pour récupérer le contenu HTML
    // Pour l'instant, nous allons utiliser les données de l'analyse déjà effectuée
    return {
      title: '',
      description: '',
      h1: '',
      h2s: [],
      h3s: [],
      h4s: [],
      visibleText: [],
      internalLinks: [],
      externalLinks: [],
      brokenLinks: [],
    };
  } catch (error) {
    console.error('Erreur lors de l\'extraction des métadonnées:', error);
    throw error;
  }
};

const categorizeLinks = (baseUrl: URL, links: string[]): { internalLinks: string[], externalLinks: string[] } => {
  const internalLinks: string[] = [];
  const externalLinks: string[] = [];

  links.forEach(href => {
    if (!href || href === '#' || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }

    try {
      const linkUrl = new URL(href, baseUrl.href);
      if (linkUrl.hostname === baseUrl.hostname) {
        internalLinks.push(linkUrl.href);
      } else {
        externalLinks.push(linkUrl.href);
      }
    } catch (error) {
      console.warn('URL invalide ignorée:', href);
    }
  });

  return {
    internalLinks: Array.from(new Set(internalLinks)),
    externalLinks: Array.from(new Set(externalLinks))
  };
};

const checkBrokenLinks = async (links: string[]): Promise<string[]> => {
  const brokenLinks: string[] = [];

  await Promise.all(
    links.map(async (link) => {
      try {
        const response = await fetch(link, { method: 'HEAD' });
        if (!response.ok) {
          brokenLinks.push(link);
        }
      } catch (error) {
        brokenLinks.push(link);
      }
    })
  );

  return Array.from(new Set(brokenLinks));
};
