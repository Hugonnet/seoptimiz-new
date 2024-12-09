import { supabase } from '@/integrations/supabase/client';

export interface SEOMetadata {
  title: string;
  description: string;
  h1: string;
  h2s: string[];
  h3s: string[];
  h4s: string[];
  visible_text: string[];
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
  
  try {
    new URL(url);
  } catch (e) {
    throw new Error("Format d'URL invalide");
  }

  const { data, error } = await supabase.functions.invoke('extract-seo', {
    body: { url },
  });

  if (error) {
    console.error('Erreur lors de l\'analyse SEO:', error);
    throw new Error(error.message || "Impossible d'analyser cette URL pour le moment");
  }

  if (!data) {
    throw new Error("Aucune donnée n'a été récupérée");
  }

  console.log('Données SEO extraites:', data);
  return data as SEOMetadata;
};

export const downloadTableAsCSV = (data: any[]) => {
  const csvRows: string[] = [];

  data.forEach((item) => {
    csvRows.push(`"Analyse SEO pour : ${item.url}"`);
    csvRows.push(`"Date d'analyse : ${new Date(item.created_at).toLocaleDateString('fr-FR')}"`);
    csvRows.push('');

    csvRows.push('"Élément","Contenu actuel","Suggestion d\'amélioration","Contexte"');

    csvRows.push(`"Titre","${escapeCSV(item.current_title)}","${escapeCSV(item.suggested_title)}","${escapeCSV(item.title_context || '')}"`);
    csvRows.push(`"Description","${escapeCSV(item.current_description)}","${escapeCSV(item.suggested_description)}","${escapeCSV(item.description_context || '')}"`);
    csvRows.push(`"H1","${escapeCSV(item.current_h1)}","${escapeCSV(item.suggested_h1)}","${escapeCSV(item.h1_context || '')}"`);

    const h2sCount = Math.max(
      (item.current_h2s || []).length,
      (item.suggested_h2s || []).length
    );
    for (let i = 0; i < h2sCount; i++) {
      csvRows.push(`"H2 ${i + 1}","${escapeCSV(item.current_h2s?.[i] || '')}","${escapeCSV(item.suggested_h2s?.[i] || '')}","${escapeCSV(item.h2s_context?.[i] || '')}"`);
    }

    const h3sCount = Math.max(
      (item.current_h3s || []).length,
      (item.suggested_h3s || []).length
    );
    for (let i = 0; i < h3sCount; i++) {
      csvRows.push(`"H3 ${i + 1}","${escapeCSV(item.current_h3s?.[i] || '')}","${escapeCSV(item.suggested_h3s?.[i] || '')}","${escapeCSV(item.h3s_context?.[i] || '')}"`);
    }

    const h4sCount = Math.max(
      (item.current_h4s || []).length,
      (item.suggested_h4s || []).length
    );
    for (let i = 0; i < h4sCount; i++) {
      csvRows.push(`"H4 ${i + 1}","${escapeCSV(item.current_h4s?.[i] || '')}","${escapeCSV(item.suggested_h4s?.[i] || '')}","${escapeCSV(item.h4s_context?.[i] || '')}"`);
    }

    // Ajout des textes visibles dans le CSV
    if (item.visible_text && Array.isArray(item.visible_text)) {
      item.visible_text.forEach((text: string, index: number) => {
        csvRows.push(`"Texte visible ${index + 1}","${escapeCSV(text)}","${escapeCSV(item.suggested_visible_text?.[index] || '')}","${escapeCSV(item.visible_text_context?.[index] || '')}"`);
      });
    }

    csvRows.push('');
    csvRows.push('');
  });

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const date = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-');
  link.href = URL.createObjectURL(blob);
  link.download = `analyse-seo-${date}.csv`;
  link.click();
};

const escapeCSV = (str: string | null | undefined): string => {
  if (!str) return '';
  return str.replace(/"/g, '""');
};
