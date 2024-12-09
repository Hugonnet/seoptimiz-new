import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "lucide-react";

export function SEOTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="text-gray-600">Balises Principales</TableHead>
        <TableHead className="text-gray-600">Balises Meta</TableHead>
        <TableHead className="text-gray-600">Structure</TableHead>
        <TableHead className="text-right text-gray-600">
          <div className="flex items-center justify-end gap-2">
            <Calendar className="h-4 w-4" />
            Date
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}