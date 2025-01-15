import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ReadabilityScoreProps {
  score: number;
}

export function ReadabilityScore({ score }: ReadabilityScoreProps) {
  const formattedScore = Math.round(score || 0);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Score de lisibilité</CardTitle>
        <CardDescription>Facilité de lecture du contenu</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress value={formattedScore} className="h-2" />
          <p className="text-sm text-gray-600">{formattedScore}/100</p>
        </div>
      </CardContent>
    </Card>
  );
}