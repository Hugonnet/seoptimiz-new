import { useNavigate } from "react-router-dom";
import { useSEOStore } from "@/store/seoStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, ExternalLink, AlertTriangle } from "lucide-react";

export default function Performance() {
  const navigate = useNavigate();
  const seoData = useSEOStore((state) => state.seoData);
  const lastAnalysis = seoData[0];

  if (!lastAnalysis) {
    navigate("/");
    return null;
  }

  const getSpeedColor = (speed: number) => {
    if (speed <= 2) return "text-green-600";
    if (speed <= 4) return "text-yellow-600";
    return "text-red-600";
  };

  const getSpeedText = (speed: number) => {
    if (speed <= 2) return "Excellent";
    if (speed <= 4) return "Acceptable";
    return "À améliorer";
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Performance de la page</h1>
      
      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">URL analysée : </h2>
            <a href={lastAnalysis.url} target="_blank" rel="noopener noreferrer" 
               className="text-purple-600 hover:text-purple-700 break-all">
              {lastAnalysis.url}
            </a>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Vitesse de chargement</h3>
            <div className="flex items-center space-x-4">
              <span className={`text-2xl font-bold ${getSpeedColor(lastAnalysis.page_load_speed)}`}>
                {getSpeedText(lastAnalysis.page_load_speed)}
              </span>
              <span className="text-gray-600">
                {lastAnalysis.page_load_speed}s
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  lastAnalysis.page_load_speed <= 2 ? 'bg-green-500' :
                  lastAnalysis.page_load_speed <= 4 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min((lastAnalysis.page_load_speed / 6) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Analyse des liens</h3>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-blue-500" />
                    Liens internes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">
                      {lastAnalysis.internal_links?.length || 0}
                    </p>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {lastAnalysis.internal_links?.map((link, index) => (
                        <p key={index} className="text-sm text-gray-600 break-all">
                          {link}
                        </p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ExternalLink className="h-5 w-5 text-green-500" />
                    Liens externes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">
                      {lastAnalysis.external_links?.length || 0}
                    </p>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {lastAnalysis.external_links?.map((link, index) => (
                        <p key={index} className="text-sm text-gray-600 break-all">
                          {link}
                        </p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Liens cassés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">
                      {lastAnalysis.broken_links?.length || 0}
                    </p>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {lastAnalysis.broken_links?.map((link, index) => (
                        <p key={index} className="text-sm text-gray-600 break-all">
                          {link}
                        </p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}