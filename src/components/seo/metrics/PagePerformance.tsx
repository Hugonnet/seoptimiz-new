import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Gauge, Smartphone } from "lucide-react";

interface PagePerformanceProps {
  loadSpeed: number;
  isMobileFriendly: boolean;
}

export function PagePerformance({ loadSpeed, isMobileFriendly }: PagePerformanceProps) {
  const formattedLoadSpeed = (loadSpeed || 0).toFixed(1);
  const progressValue = loadSpeed ? (1 / loadSpeed) * 100 : 0;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vitesse de chargement</CardTitle>
          <CardDescription>Performance de la page</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Gauge className="h-5 w-5 text-purple-600" />
            <div className="space-y-1">
              <Progress value={progressValue} className="h-2" />
              <p className="text-sm text-gray-600">{formattedLoadSpeed}s</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compatibilité mobile</CardTitle>
          <CardDescription>Adaptation aux appareils mobiles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Smartphone className={`h-5 w-5 ${isMobileFriendly ? 'text-green-500' : 'text-red-500'}`} />
            <span className={isMobileFriendly ? 'text-green-600' : 'text-red-600'}>
              {isMobileFriendly ? 'Compatible' : 'Non compatible'}
            </span>
          </div>
        </CardContent>
      </Card>
    </>
  );
}