import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Timer, Gauge, ArrowUp, ArrowDown } from "lucide-react";

export function PerformanceCards() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Timer className="h-5 w-5 text-purple-600" />
              Temps de chargement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={85} className="h-2" />
              <p className="text-sm text-gray-600">0.85 secondes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Gauge className="h-5 w-5 text-purple-600" />
              Performance globale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={92} className="h-2" />
              <p className="text-sm text-gray-600">92/100</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowUp className="h-5 w-5 text-green-600" />
              Vitesse Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={78} className="h-2" />
              <p className="text-sm text-gray-600">15 Mb/s</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowDown className="h-5 w-5 text-blue-600" />
              Vitesse Download
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={88} className="h-2" />
              <p className="text-sm text-gray-600">45 Mb/s</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}