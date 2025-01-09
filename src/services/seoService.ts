import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  // Grouper les données par entreprise
  const companiesData = data.reduce((acc, item) => {
    const company = item.company || 'Non spécifié';
    if (!acc[company]) {
      acc[company] = [];
    }
    acc[company].push(item);
    return acc;
  }, {});

  // Créer un fichier CSV pour chaque entreprise
  Object.entries(companiesData).forEach(([company, companyData]) => {
    const csvRows: string[] = [];

    csvRows.push(`"Analyse SEO pour l'entreprise : ${company}"`);
    csvRows.push(''); // Ligne vide pour la lisibilité

    (companyData as any[]).forEach((item) => {
      // Formater la date en français
      const formattedDate = format(new Date(item.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr });
      
      csvRows.push(`"URL analysée : ${item.url}"`);
      csvRows.push(`"Date d'analyse : ${formattedDate}"`);
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
      if (item.current_h2s && item.current_h2s.length > 0) {
        const h2sCount = Math.max(
          item.current_h2s.length,
          (item.suggested_h2s || []).length
        );
        for (let i = 0; i < h2sCount; i++) {
          csvRows.push(`"H2 ${i + 1}","${escapeCSV(item.current_h2s[i] || '')}","${escapeCSV(item.suggested_h2s?.[i] || '')}","${escapeCSV(item.h2s_context?.[i] || '')}"`);
        }
      }

      // H3s
      if (item.current_h3s && item.current_h3s.length > 0) {
        const h3sCount = Math.max(
          item.current_h3s.length,
          (item.suggested_h3s || []).length
        );
        for (let i = 0; i < h3sCount; i++) {
          csvRows.push(`"H3 ${i + 1}","${escapeCSV(item.current_h3s[i] || '')}","${escapeCSV(item.suggested_h3s?.[i] || '')}","${escapeCSV(item.h3s_context?.[i] || '')}"`);
        }
      }

      // H4s
      if (item.current_h4s && item.current_h4s.length > 0) {
        const h4sCount = Math.max(
          item.current_h4s.length,
          (item.suggested_h4s || []).length
        );
        for (let i = 0; i < h4sCount; i++) {
          csvRows.push(`"H4 ${i + 1}","${escapeCSV(item.current_h4s[i] || '')}","${escapeCSV(item.suggested_h4s?.[i] || '')}","${escapeCSV(item.h4s_context?.[i] || '')}"`);
        }
      }

      // Ajouter des lignes vides entre chaque URL
      csvRows.push('');
      csvRows.push('');
    });

    // Créer et télécharger le fichier CSV
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const date = format(new Date(), 'dd-MM-yyyy', { locale: fr });
    const safeCompanyName = company.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.href = URL.createObjectURL(blob);
    link.download = `analyse-seo-${safeCompanyName}-${date}.csv`;
    link.click();
  });
};

// Fonction utilitaire pour échapper les caractères spéciaux dans le CSV
const escapeCSV = (str: string | null | undefined): string => {
  if (!str) return '';
  return str.replace(/"/g, '""');
};