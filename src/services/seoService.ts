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
  // Pour chaque URL analysée
  const csvRows: string[] = [];

  data.forEach((item) => {
    // Ajouter l'URL et la date comme en-tête de section
    csvRows.push(`"Analyse SEO pour : ${item.url}"`);
    csvRows.push(`"Date d'analyse : ${new Date(item.created_at).toLocaleDateString('fr-FR')}"`);
    csvRows.push(''); // Ligne vide pour la lisibilité

    // En-têtes des colonnes
    csvRows.push('"Élément","Contenu actuel","Suggestion d\'amélioration","Contexte"');

    // Titre
    csvRows.push(`"Titre","${escapeCSV(item.current_title)}","${escapeCSV(item.suggested_title)}","${escapeCSV(item.title_context || '')}"`);

    // Description
    csvRows.push(`"Description","${escapeCSV(item.current_description)}","${escapeCSV(item.suggested_description)}","${escapeCSV(item.description_context || '')}"`);

    // H1
    csvRows.push(`"H1","${escapeCSV(item.current_h1)}","${escapeCSV(item.suggested_h1)}","${escapeCSV(item.h1_context || '')}"`);

    // H2s
    const h2sCount = Math.max(
      (item.current_h2s || []).length,
      (item.suggested_h2s || []).length
    );
    for (let i = 0; i < h2sCount; i++) {
      csvRows.push(`"H2 ${i + 1}","${escapeCSV(item.current_h2s?.[i] || '')}","${escapeCSV(item.suggested_h2s?.[i] || '')}","${escapeCSV(item.h2s_context?.[i] || '')}"`);
    }

    // H3s
    const h3sCount = Math.max(
      (item.current_h3s || []).length,
      (item.suggested_h3s || []).length
    );
    for (let i = 0; i < h3sCount; i++) {
      csvRows.push(`"H3 ${i + 1}","${escapeCSV(item.current_h3s?.[i] || '')}","${escapeCSV(item.suggested_h3s?.[i] || '')}","${escapeCSV(item.h3s_context?.[i] || '')}"`);
    }

    // H4s
    const h4sCount = Math.max(
      (item.current_h4s || []).length,
      (item.suggested_h4s || []).length
    );
    for (let i = 0; i < h4sCount; i++) {
      csvRows.push(`"H4 ${i + 1}","${escapeCSV(item.current_h4s?.[i] || '')}","${escapeCSV(item.suggested_h4s?.[i] || '')}","${escapeCSV(item.h4s_context?.[i] || '')}"`);
    }

    // Ajouter une ligne vide entre chaque analyse d'URL
    csvRows.push('');
    csvRows.push(''); // Double ligne vide pour plus de lisibilité
  });

  // Créer et télécharger le fichier CSV
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const date = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-');
  link.href = URL.createObjectURL(blob);
  link.download = `analyse-seo-${date}.csv`;
  link.click();
};

// Fonction utilitaire pour échapper les caractères spéciaux dans le CSV
const escapeCSV = (str: string | null | undefined): string => {
  if (!str) return '';
  return str.replace(/"/g, '""');
};