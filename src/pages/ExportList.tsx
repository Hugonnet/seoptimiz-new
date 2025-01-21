import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSEOStore } from '@/store/seoStore';
import { downloadTableAsCSV } from '@/services/seoService';
import { archiveCompanyAnalyses, deleteCompanyAnalyses } from '@/services/exportService';

export default function ExportList() {
  const { seoData, setSEOData } = useSEOStore();
  
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

  return (
    <div className="container mx-auto px-4 py-8">
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
                          onClick={() => archiveCompanyAnalyses(company, setSEOData, seoData)}
                        >
                          <Archive className="h-4 w-4 mr-1" />
                          Archiver
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteCompanyAnalyses(company, setSEOData, seoData)}
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