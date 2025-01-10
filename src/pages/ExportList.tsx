import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSEOStore } from '@/store/seoStore';
import { downloadTableAsCSV } from '@/services/seoService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function ExportList() {
  const { seoData, setSEOData } = useSEOStore();
  const { toast } = useToast();
  
  // Group data by company, handling empty or undefined company names
  const companiesData = seoData.reduce((acc, item) => {
    const company = item.company?.trim() || 'Sans nom d\'entreprise';
    if (!acc[company]) {
      acc[company] = [];
    }
    if (!item.archived) { // Only include non-archived items
      acc[company].push(item);
    }
    return acc;
  }, {} as Record<string, typeof seoData>);

  // Sort companies alphabetically
  const sortedCompanies = Object.entries(companiesData)
    .sort(([a], [b]) => a.localeCompare(b))
    .filter(([_, data]) => data.length > 0); // Only show companies with non-archived analyses

  const handleArchive = async (company: string) => {
    try {
      const { error } = await supabase
        .from('seo_analyses')
        .update({ archived: true })
        .eq('company', company);

      if (error) throw error;

      // Update local state
      const updatedData = seoData.map(item => 
        item.company === company ? { ...item, archived: true } : item
      );
      setSEOData(updatedData);

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

  const handleDelete = async (company: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement toutes les analyses pour ${company} ?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('seo_analyses')
        .delete()
        .eq('company', company);

      if (error) throw error;

      // Update local state
      const updatedData = seoData.filter(item => item.company !== company);
      setSEOData(updatedData);

      toast({
        title: "Analyses supprimées",
        description: `Les analyses pour ${company} ont été supprimées avec succès.`,
      });
    } catch (error) {
      console.error('Error deleting analyses:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression des analyses.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Exports CSV par entreprise</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedCompanies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune analyse SEO active n'est disponible pour le moment.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Nombre d'analyses</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCompanies.map(([company, data]) => (
                  <TableRow key={company}>
                    <TableCell className="font-medium">{company}</TableCell>
                    <TableCell>{data.length}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadTableAsCSV(data)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Télécharger
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleArchive(company)}
                        >
                          <Archive className="h-4 w-4 mr-1" />
                          Archiver
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(company)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}