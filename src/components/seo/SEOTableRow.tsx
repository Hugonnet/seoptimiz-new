import { TableCell, TableRow } from "@/components/ui/table";
import { SEOTableActions } from "./SEOTableActions";
import type { SEOAnalysis } from "@/store/seoStore";

interface SEOTableRowProps {
  url: string;
  analyses: SEOAnalysis[];
  selectedUrl: string | null;
  onViewAnalysis: (url: string) => void;
  onDeleteAnalysis: (url: string) => void;
}

export function SEOTableRow({ url, analyses, selectedUrl, onViewAnalysis, onDeleteAnalysis }: SEOTableRowProps) {
  return (
    <TableRow key={url} className="hover:bg-purple-50/20" id={`analysis-${encodeURIComponent(url)}`}>
      <TableCell className="font-medium max-w-md truncate">
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800">
          {url}
        </a>
      </TableCell>
      <TableCell>{analyses.length}</TableCell>
      <TableCell>
        {new Date(analyses[0].created_at!).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </TableCell>
      <TableCell className="text-right">
        <SEOTableActions
          url={url}
          selectedUrl={selectedUrl}
          onViewAnalysis={onViewAnalysis}
          onDeleteAnalysis={onDeleteAnalysis}
        />
      </TableCell>
    </TableRow>
  );
}