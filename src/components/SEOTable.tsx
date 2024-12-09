import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { SEOTableHeader } from "./SEOTableHeader";
import { downloadTableAsCSV } from "@/services/seoService";
import { useSEOStore } from "@/store/seoStore";

export function SEOTable() {
  const seoData = useSEOStore((state) => state.seoData);

  const renderTagContent = (current: string, suggested: string) => (
    <div className="space-y-2">
      <div className="text-gray-700">{current}</div>
      <div className="font-bold text-purple-600">{suggested}</div>
    </div>
  );

  if (seoData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 glass-card rounded-xl">
        Aucune donnée SEO disponible. Analysez une URL pour commencer.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {seoData.map((item) => (
        <div key={item.id} className="space-y-4">
          <div className="text-left space-y-2">
            <h2 className="text-xl font-semibold text-gray-800">{item.url}</h2>
          </div>
          
          <div className="rounded-xl glass-card overflow-hidden">
            <Table>
              <SEOTableHeader />
              <TableBody>
                <TableRow className="hover:bg-gray-50/50">
                  <TableCell>
                    <div className="space-y-4">
                      {renderTagContent("Titre actuel", "Titre optimisé pour le SEO")}
                      {renderTagContent("H1: " + item.currentTitle, "H1 optimisé: Un titre plus descriptif")}
                      {renderTagContent("H2: Sous-titre actuel", "H2 optimisé: Un sous-titre plus pertinent")}
                      {renderTagContent("H3: Section actuelle", "H3 optimisé: Une section mieux structurée")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-4">
                      {renderTagContent("Meta Description actuelle", item.currentDescription)}
                      {renderTagContent("Meta Description optimisée", "Description plus attractive et pertinente pour les moteurs de recherche")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-4">
                      {renderTagContent("Structure actuelle", "Hiérarchie des titres bien définie")}
                      {renderTagContent("Balises sémantiques", "Utilisation optimale des balises article, section, nav")}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-gray-600">{item.date}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => downloadTableAsCSV(seoData)} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}