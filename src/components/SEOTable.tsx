import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { SEOTableHeader } from "./SEOTableHeader";
import { downloadTableAsCSV } from "@/services/seoService";
import { useSEOStore } from "@/store/seoStore";

export function SEOTable() {
  const seoData = useSEOStore((state) => state.seoData);

  const renderSuggestion = (text: string) => (
    <span className="font-bold text-purple-600">{text}</span>
  );

  const handleDownload = () => {
    downloadTableAsCSV(seoData);
  };

  if (seoData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune donnée SEO disponible. Analysez une URL pour commencer.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {seoData.map((item) => (
        <div key={item.id} className="space-y-4">
          <div className="text-left space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">{item.url}</h2>
            <p className="text-gray-600">{item.currentTitle}</p>
          </div>
          
          <div className="rounded-xl border bg-white/80 backdrop-blur-sm shadow-sm">
            <Table>
              <SEOTableHeader />
              <TableBody>
                <TableRow className="hover:bg-purple-50/50">
                  <TableCell>{item.currentDescription}</TableCell>
                  <TableCell>{renderSuggestion(item.suggestedDescription)}</TableCell>
                  <TableCell className="text-right">{item.date}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
      
      <div className="flex justify-end">
        <Button onClick={handleDownload} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exporter le rapport
        </Button>
      </div>
    </div>
  );
}