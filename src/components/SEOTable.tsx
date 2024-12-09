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
                    {renderTagContent("Title", item.currentTitle)}
                  </TableCell>
                  <TableCell>
                    {renderTagContent("Meta Description", item.currentDescription)}
                  </TableCell>
                  <TableCell>
                    {renderTagContent("H1", "Titre principal actuel")}
                  </TableCell>
                  <TableCell className="text-right text-white/80">{item.date}</TableCell>
                </TableRow>
                <TableRow className="hover:bg-white/5">
                  <TableCell>
                    {renderTagContent("H2", "Sous-titre actuel")}
                  </TableCell>
                  <TableCell>
                    {renderTagContent("H3", "Sous-section actuelle")}
                  </TableCell>
                  <TableCell>
                    {renderTagContent("H4", "Sous-partie actuelle")}
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