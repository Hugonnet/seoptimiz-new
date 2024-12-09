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
      <div className="text-center py-8 text-gray-600 bg-white rounded-xl shadow-sm border border-gray-100">
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
          
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <Table>
              <SEOTableHeader />
              <TableBody>
                <TableRow className="hover:bg-gray-50/50">
                  <TableCell>
                    <div className="space-y-4">
                      {renderTagContent(
                        "Titre actuel: " + item.currentTitle,
                        "Titre optimisé: " + item.suggestedTitle
                      )}
                      {renderTagContent(
                        "H1 actuel: " + item.currentH1,
                        "H1 optimisé: Un titre principal plus descriptif et optimisé pour le SEO"
                      )}
                      {renderTagContent(
                        "H2 actuel: Application Frigorifique, Géothermie, Conditionnement d'air et Climatisation",
                        "H2 optimisé: Solutions complètes en Froid Industriel, Géothermie et Climatisation Professionnelle"
                      )}
                      {renderTagContent(
                        "H3 actuel: Nos services",
                        "H3 optimisé: Expertise en Installation et Maintenance de Systèmes Thermiques"
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-4">
                      {renderTagContent(
                        "Description actuelle: " + item.currentDescription,
                        "Description optimisée: " + item.suggestedDescription
                      )}
                      {renderTagContent(
                        "Mots-clés actuels: froid industriel, géothermie, climatisation",
                        "Mots-clés optimisés: solutions frigorifiques, géothermie professionnelle, systèmes de climatisation industrielle"
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-4">
                      {renderTagContent(
                        "Structure actuelle: Hiérarchie des titres bien définie",
                        "Structure optimisée: Organisation logique des sections avec mots-clés ciblés"
                      )}
                      {renderTagContent(
                        "Balises sémantiques actuelles: article, section, nav",
                        "Balises sémantiques optimisées: Utilisation stratégique des balises HTML5"
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-gray-600">{item.date}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => downloadTableAsCSV(seoData)} variant="outline" className="gap-2 gradient-button">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}