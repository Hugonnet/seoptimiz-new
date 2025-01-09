import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSEOStore } from '@/store/seoStore';
import { downloadTableAsCSV } from '@/services/seoService';

export default function ExportList() {
  const { seoData } = useSEOStore();
  
  // Group data by company
  const companiesData = seoData.reduce((acc, item) => {
    const company = item.company || 'Sans nom';
    if (!acc[company]) {
      acc[company] = [];
    }
    acc[company].push(item);
    return acc;
  }, {} as Record<string, typeof seoData>);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Exports CSV par entreprise</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entreprise</TableHead>
                <TableHead>Nombre d'analyses</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(companiesData).map(([company, data]) => (
                <TableRow key={company}>
                  <TableCell className="font-medium">{company}</TableCell>
                  <TableCell>{data.length}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadTableAsCSV(data)}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Télécharger
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}