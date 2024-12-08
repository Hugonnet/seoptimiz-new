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
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.url}</TableCell>
              <TableCell>{item.currentTitle}</TableCell>
              <TableCell>{item.suggestedTitle}</TableCell>
              <TableCell>{item.currentDescription}</TableCell>
              <TableCell>{item.suggestedDescription}</TableCell>
              <TableCell>{item.currentH1}</TableCell>
              <TableCell>{item.suggestedH1}</TableCell>
              <TableCell>{item.optimizationStatus}</TableCell>
              <TableCell>{item.aiComments}</TableCell>
              <TableCell className="text-right">{item.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}