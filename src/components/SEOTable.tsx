import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "lucide-react";

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
      }
    ],
    h3s: [
      {
        current: "H3 actuel 1",
        suggested: "Suggestion H3 1",
        contextText: "Texte contextuel du H3 1",
        suggestedText: "Suggestion de texte pour H3 1"
      }
    ]
  }
];

export function SEOTable() {
  const renderSuggestion = (text: string) => (
    <span className="font-bold">{text}</span>
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">URL</TableHead>
            <TableHead>Titre Actuel</TableHead>
            <TableHead>Titre Suggéré</TableHead>
            <TableHead>Description Actuelle</TableHead>
            <TableHead>Description Suggérée</TableHead>
            <TableHead>H1 Actuel</TableHead>
            <TableHead>H1 Suggéré</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Commentaires IA</TableHead>
            <TableHead className="text-right">
              <div className="flex items-center justify-end gap-2">
                <Calendar className="h-4 w-4" />
                Date
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockData.map((item) => (
            <>
              <TableRow key={item.id}>
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
                <TableRow key={`h2-${index}`}>
                  <TableCell colSpan={2} className="font-medium">H2 {index + 1}</TableCell>
                  <TableCell>{h2.current}</TableCell>
                  <TableCell>{renderSuggestion(h2.suggested)}</TableCell>
                  <TableCell>{h2.contextText}</TableCell>
                  <TableCell colSpan={5}>{renderSuggestion(h2.suggestedText)}</TableCell>
                </TableRow>
              ))}
              {item.h3s.map((h3, index) => (
                <TableRow key={`h3-${index}`}>
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
  );
}