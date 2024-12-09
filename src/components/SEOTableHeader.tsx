import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "lucide-react";

export function SEOTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="text-white/80">Balises Principales</TableHead>
        <TableHead className="text-white/80">Balises Meta</TableHead>
        <TableHead className="text-white/80">Structure</TableHead>
        <TableHead className="text-right text-white/80">
          <div className="flex items-center justify-end gap-2">
            <Calendar className="h-4 w-4" />
            Date
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}