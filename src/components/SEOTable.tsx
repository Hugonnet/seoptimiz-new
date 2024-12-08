import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { SEOTableHeader } from "./SEOTableHeader";
import { downloadTableAsCSV } from "@/services/seoService";

interface SEOData {
  id: string;
  url: string;
  currentTitle: string;
  suggestedTitle: string;
  currentDescription: string;
  suggestedDescription: string;
  currentH1: string;
  suggestedH1: string;
  optimizationStatus: "Partiel" | "Complet";
  aiComments: string;
  date: string;
  h2s: Array<{
    current: string;
    suggested: string;
    contextText: string;
    suggestedText: string;
  }>;
  h3s: Array<{
    current: string;
    suggested: string;
    contextText: string;
    suggestedText: string;
  }>;
}

const mockData: SEOData[] = [
  {
    id: "1",
    url: "exemple.com",
    currentTitle: "Titre actuel de la page",
    suggestedTitle: "Suggestion de titre optimisé",
    currentDescription: "Description actuelle de la page",
    suggestedDescription: "Suggestion de description optimisée",
    currentH1: "H1 actuel",
    suggestedH1: "Suggestion de H1 optimisé",
    optimizationStatus: "Partiel",
    aiComments: "Plusieurs optimisations possibles",
    date: "2024-03-10",
    h2s: [
      {
        current: "H2 actuel 1",
        suggested: "Suggestion H2 1",
        contextText: "Texte contextuel du H2 1",
        suggestedText: "Suggestion de texte pour H2 1"
      },
      {
        current: "H2 actuel 2",
        suggested: "Suggestion H2 2",
        contextText: "Texte contextuel du H2 2",
        suggestedText: "Suggestion de texte pour H2 2"
      }
    ],
    h3s: Array.from({ length: 10 }, (_, i) => ({
      current: `H3 actuel ${i + 1}`,
      suggested: `Suggestion H3 ${i + 1}`,
      contextText: `Texte contextuel du H3 ${i + 1}`,
      suggestedText: `Suggestion de texte pour H3 ${i + 1}`
    }))
  }
];

export function SEOTable() {
  const renderSuggestion = (text: string) => (
    <span className="font-bold text-primary">{text}</span>
  );

  const handleDownload = () => {
    downloadTableAsCSV(mockData);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleDownload} className="mb-4">
          <Download className="mr-2 h-4 w-4" />
          Télécharger CSV
        </Button>
      </div>
      <div className="rounded-md border bg-white/80 backdrop-blur-sm shadow-lg">
        <Table>
          <SEOTableHeader />
          <TableBody>
            {mockData.map((item) => (
              <>
                <TableRow key={`h1-${item.id}`} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{item.url}</TableCell>
                  <TableCell>{item.currentTitle}</TableCell>
                  <TableCell>{renderSuggestion(item.suggestedTitle)}</TableCell>
                  <TableCell>{item.currentDescription}</TableCell>
                  <TableCell>{renderSuggestion(item.suggestedDescription)}</TableCell>
                  <TableCell>{item.currentH1}</TableCell>
                  <TableCell>{renderSuggestion(item.suggestedH1)}</TableCell>
                  <TableCell>{item.optimizationStatus}</TableCell>
                  <TableCell>{renderSuggestion(item.aiComments)}</TableCell>
                  <TableCell className="text-right">{item.date}</TableCell>
                </TableRow>
                {item.h2s.map((h2, index) => (
                  <TableRow key={`h2-${index}`} className="bg-muted/5">
                    <TableCell colSpan={2} className="font-medium">H2 {index + 1}</TableCell>
                    <TableCell>{h2.current}</TableCell>
                    <TableCell>{renderSuggestion(h2.suggested)}</TableCell>
                    <TableCell>{h2.contextText}</TableCell>
                    <TableCell colSpan={5}>{renderSuggestion(h2.suggestedText)}</TableCell>
                  </TableRow>
                ))}
                {item.h3s.map((h3, index) => (
                  <TableRow key={`h3-${index}`} className="bg-muted/10">
                    <TableCell colSpan={2} className="font-medium">H3 {index + 1}</TableCell>
                    <TableCell>{h3.current}</TableCell>
                    <TableCell>{renderSuggestion(h3.suggested)}</TableCell>
                    <TableCell>{h3.contextText}</TableCell>
                    <TableCell colSpan={5}>{renderSuggestion(h3.suggestedText)}</TableCell>
                  </TableRow>
                ))}
              </>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}