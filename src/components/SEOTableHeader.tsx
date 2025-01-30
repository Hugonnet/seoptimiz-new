import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function SEOTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="text-gray-600 w-1/2">Dénominations actuelles</TableHead>
        <TableHead className="text-gray-600 w-1/2">Améliorations suggérées par I.A</TableHead>
      </TableRow>
    </TableHeader>
  );
}