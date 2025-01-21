import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link2, AlertTriangle } from "lucide-react";
import { useSEOStore } from '@/store/seoStore';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

export default function Performance() {
  const seoData = useSEOStore((state) => state.seoData);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);

  useEffect(() => {
    if (!seoData || seoData.length === 0) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Aucune URL n'a été analysée. Veuillez d'abord analyser une URL.",
      });
      navigate('/');
      return;
    }

    setLastAnalysis(seoData[0]);
  }, [seoData, navigate, toast]);

  if (!lastAnalysis) {
    return null;
  }

  const getSpeedColor = (speed: number) => {
    if (speed <= 2) return 'bg-green-500';
    if (speed <= 4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSpeedText = (speed: number) => {
    if (speed <= 2) return 'Excellent';
    if (speed <= 4) return 'Acceptable';
    return 'À améliorer';
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Performance de la page</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              URL analysée : <span className="text-purple-600 break-all">{lastAnalysis.url}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Vitesse de chargement */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Vitesse de chargement</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>{getSpeedText(lastAnalysis.page_load_speed || 0)}</span>
                  <span>{lastAnalysis.page_load_speed?.toFixed(2) || 0}s</span>
                </div>
                <Progress 
                  value={Math.min(100, (lastAnalysis.page_load_speed || 0) * 20)} 
                  className={`h-2 ${getSpeedColor(lastAnalysis.page_load_speed || 0)}`}
                />
              </div>
            </div>

            {/* Liens */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Analyse des liens</h3>
              
              {/* Liens internes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-blue-500" />
                    Liens internes
                  </span>
                  <Badge variant="outline">{lastAnalysis.internal_links?.length || 0}</Badge>
                </div>
                <div className="pl-6 space-y-1">
                  {lastAnalysis.internal_links?.map((link: string, index: number) => (
                    <div key={index} className="text-sm text-gray-600 break-all">
                      {link}
                    </div>
                  ))}
                </div>
              </div>

              {/* Liens externes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-green-500" />
                    Liens externes
                  </span>
                  <Badge variant="outline">{lastAnalysis.external_links?.length || 0}</Badge>
                </div>
                <div className="pl-6 space-y-1">
                  {lastAnalysis.external_links?.map((link: string, index: number) => (
                    <div key={index} className="text-sm text-gray-600 break-all">
                      {link}
                    </div>
                  ))}
                </div>
              </div>

              {/* Liens cassés */}
              {lastAnalysis.broken_links && lastAnalysis.broken_links.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-red-500">
                      <AlertTriangle className="h-4 w-4" />
                      Liens cassés
                    </span>
                    <Badge variant="destructive">{lastAnalysis.broken_links.length}</Badge>
                  </div>
                  <div className="pl-6 space-y-1">
                    {lastAnalysis.broken_links.map((link: string, index: number) => (
                      <div key={index} className="text-sm text-red-500 break-all">
                        {link}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}