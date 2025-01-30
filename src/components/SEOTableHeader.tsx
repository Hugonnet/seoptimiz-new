import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function SEOTableHeader() {
  return (
    <TableHeader>
      <TableRow className="bg-purple-50/50">
        <TableHead>URL analysée</TableHead>
        <TableHead>Nombre d'analyses</TableHead>
        <TableHead>Dernière analyse</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}