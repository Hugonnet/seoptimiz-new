
import { JSDOM } from 'jsdom';
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
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const baseUrl = new URL(url);

    // Extraire les liens
    const links = Array.from(document.querySelectorAll('a')) as HTMLAnchorElement[];
    const { internalLinks, externalLinks } = categorizeLinks(links, baseUrl);
    const brokenLinks = await checkBrokenLinks([...internalLinks, ...externalLinks]);

    // Extraire le texte visible avec typage explicite
    const visibleText = Array.from(document.body.querySelectorAll('p, li, td, th, div, span'))
      .map(element => (element as HTMLElement).textContent?.trim())
      .filter((text): text is string => text !== undefined && text !== '');

    const metadata: SEOMetadata = {
      title: document.title || '',
      description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
      h1: (document.querySelector('h1') as HTMLElement)?.textContent?.trim() || '',
      h2s: Array.from(document.querySelectorAll('h2')).map(h2 => (h2 as HTMLElement).textContent?.trim() || ''),
      h3s: Array.from(document.querySelectorAll('h3')).map(h3 => (h3 as HTMLElement).textContent?.trim() || ''),
      h4s: Array.from(document.querySelectorAll('h4')).map(h4 => (h4 as HTMLElement).textContent?.trim() || ''),
      visibleText,
      internalLinks: Array.from(new Set(internalLinks)),
      externalLinks: Array.from(new Set(externalLinks)),
      brokenLinks: Array.from(new Set(brokenLinks)),
    };

    console.log('Métadonnées extraites avec succès');
    return metadata;
  } catch (error) {
    console.error('Erreur lors de l\'extraction des métadonnées:', error);
    throw error;
  }
};

const categorizeLinks = (links: HTMLAnchorElement[], baseUrl: URL): { internalLinks: string[], externalLinks: string[] } => {
  const internalLinks: string[] = [];
  const externalLinks: string[] = [];

  links.forEach(link => {
    const href = link.href?.trim();
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
    internalLinks: internalLinks.filter(Boolean),
    externalLinks: externalLinks.filter(Boolean)
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

  return brokenLinks;
};
