import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "lucide-react";

export function SEOTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Description Actuelle</TableHead>
        <TableHead>Description Suggérée</TableHead>
        <TableHead className="text-right">
          <div className="flex items-center justify-end gap-2">
            <Calendar className="h-4 w-4" />
            Date
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}