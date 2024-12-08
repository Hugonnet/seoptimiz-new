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
  existingContent: string;
  suggestedContent: string;
  date: string;
  type: string;
}

const mockData: SEOData[] = [
  {
    id: "1",
    url: "exemple.com",
    existingContent: "Balise titre actuelle",
    suggestedContent: "Suggestion d'amélioration",
    date: "2024-03-10",
    type: "Balise titre"
  },
  {
    id: "2",
    url: "exemple.com",
    existingContent: "Description meta actuelle",
    suggestedContent: "Suggestion d'amélioration meta",
    date: "2024-03-10",
    type: "Balise description"
  },
  // ... autres exemples
];

export function SEOTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">URL à analyser</TableHead>
            <TableHead>Contenu existant</TableHead>
            <TableHead>Contenu suggéré par IA</TableHead>
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
              <TableCell className="font-medium">{item.type}</TableCell>
              <TableCell>{item.existingContent}</TableCell>
              <TableCell>{item.suggestedContent}</TableCell>
              <TableCell className="text-right">{item.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}