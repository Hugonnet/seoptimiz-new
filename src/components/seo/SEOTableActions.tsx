import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SEOTableActionsProps {
  url: string;
  selectedUrl: string | null;
  onViewAnalysis: (url: string) => void;
  onDeleteAnalysis: (url: string) => void;
}

export function SEOTableActions({ url, selectedUrl, onViewAnalysis, onDeleteAnalysis }: SEOTableActionsProps) {
  return (
    <div className="flex justify-end gap-4">
      <Button
        variant="outline"
        size="sm"
        className="gap-2 bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200 border-purple-200"
        onClick={() => onViewAnalysis(url)}
      >
        <Eye className="h-4 w-4" />
        Voir les analyses
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="destructive" 
            size="sm"
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action va supprimer toutes les analyses pour {url}.
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUrl && onDeleteAnalysis(selectedUrl)}
              className="bg-red-500 hover:bg-red-600"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}