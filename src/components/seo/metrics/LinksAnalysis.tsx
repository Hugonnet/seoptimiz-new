import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link2, AlertTriangle } from "lucide-react";

interface LinksAnalysisProps {
  internalLinks: string[];
  externalLinks: string[];
  brokenLinks: string[];
}

export function LinksAnalysis({ internalLinks = [], externalLinks = [], brokenLinks = [] }: LinksAnalysisProps) {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Analyse des liens</CardTitle>
        <CardDescription>État des liens de la page</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-blue-500" />
              Liens internes
            </span>
            <Badge variant="outline">{internalLinks.length}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-green-500" />
              Liens externes
            </span>
            <Badge variant="outline">{externalLinks.length}</Badge>
          </div>
          {brokenLinks.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="h-4 w-4" />
                Liens cassés
              </span>
              <Badge variant="destructive">{brokenLinks.length}</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}