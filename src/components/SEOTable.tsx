import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { SEOTableHeader } from "./SEOTableHeader";
import { downloadTableAsCSV } from "@/services/seoService";
import { useSEOStore } from "@/store/seoStore";

export function SEOTable() {
  const seoData = useSEOStore((state) => state.seoData);

  const renderTagContent = (label: string, current: string, suggested: string) => (
    <div className="space-y-1">
      <div className="text-sm text-white/60">{label}</div>
      <div className="text-white/80">{current}</div>
      <div className="font-bold text-purple-400">{suggested}</div>
    </div>
  );

  const handleDownload = () => {
    downloadTableAsCSV(seoData);
  };

  if (seoData.length === 0) {
    return (
      <div className="text-center py-8 text-white/80 backdrop-blur-sm rounded-xl">
        Aucune donnée SEO disponible. Analysez une URL pour commencer.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {seoData.map((item) => (
        <div key={item.id} className="space-y-4">
          <div className="text-left space-y-2">
            <h2 className="text-xl font-semibold text-white">{item.url}</h2>
          </div>
          
          <div className="rounded-xl glass-card overflow-hidden">
            <Table>
              <SEOTableHeader />
              <TableBody>
                <TableRow className="hover:bg-white/5">
                  <TableCell>
                    {renderTagContent("Title", item.currentTitle, "Titre suggéré optimisé pour le SEO")}
                  </TableCell>
                  <TableCell>
                    {renderTagContent("Meta Description", item.currentDescription, "Description suggérée optimisée")}
                  </TableCell>
                  <TableCell>
                    {renderTagContent("H1", "Titre principal actuel", "Titre H1 suggéré")}
                  </TableCell>
                  <TableCell className="text-right text-white/80">{item.date}</TableCell>
                </TableRow>
                <TableRow className="hover:bg-white/5">
                  <TableCell>
                    {renderTagContent("H2", "Sous-titre actuel", "Sous-titre H2 suggéré")}
                  </TableCell>
                  <TableCell>
                    {renderTagContent("H3", "Sous-section actuelle", "Sous-section H3 suggérée")}
                  </TableCell>
                  <TableCell>
                    {renderTagContent("H4", "Sous-partie actuelle", "Sous-partie H4 suggérée")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button onClick={handleDownload} variant="outline" className="gap-2 bg-white/10 text-white hover:bg-white/20">
                      <Download className="h-4 w-4" />
                      Exporter
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
}