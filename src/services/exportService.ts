import { supabase } from '@/integrations/supabase/client';
import { downloadTableAsCSV } from './seoService';
import { toast } from '@/hooks/use-toast';
import { SEOAnalysis } from '@/store/seoStore';

export const archiveCompanyAnalyses = async (
  company: string,
  updateCallback: (data: SEOAnalysis[]) => void,
  currentData: SEOAnalysis[]
) => {
  try {
    const isNoCompany = company === 'Sans nom d\'entreprise';
    const query = supabase
      .from('seo_analyses')
      .update({ archived: true });

    if (isNoCompany) {
      query.is('company', null);
    } else {
      query.eq('company', company);
    }

    const { error } = await query;
    if (error) throw error;

    // Update local state
    const updatedData = currentData.map(item => 
      (item.company === company || (!item.company && isNoCompany))
        ? { ...item, archived: true }
        : item
    );
    updateCallback(updatedData);

    toast({
      title: "Analyses archivées",
      description: `Les analyses pour ${company} ont été archivées avec succès.`,
    });
  } catch (error) {
    console.error('Error archiving analyses:', error);
    toast({
      title: "Erreur",
      description: "Une erreur est survenue lors de l'archivage des analyses.",
      variant: "destructive",
    });
  }
};

export const deleteCompanyAnalyses = async (
  company: string,
  updateCallback: (data: SEOAnalysis[]) => void,
  currentData: SEOAnalysis[]
) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement toutes les analyses pour ${company} ?`)) {
    return;
  }

  try {
    console.log('Deleting analyses for company:', company);
    const isNoCompany = company === 'Sans nom d\'entreprise';
    
    const query = supabase
      .from('seo_analyses')
      .delete();
    
    if (isNoCompany) {
      query.is('company', null);
    } else {
      query.eq('company', company);
    }

    const { error: deleteError } = await query;
    if (deleteError) throw deleteError;

    // Update local state
    const updatedData = currentData.filter(item => 
      isNoCompany 
        ? item.company !== null && item.company !== ''
        : item.company !== company
    );
    updateCallback(updatedData);

    toast({
      title: "Analyses supprimées",
      description: `Les analyses pour ${company} ont été supprimées avec succès.`,
    });
  } catch (error) {
    console.error('Error in handleDelete:', error);
    toast({
      title: "Erreur",
      description: "Une erreur est survenue lors de la suppression des analyses.",
      variant: "destructive",
    });
  }
};