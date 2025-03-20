import { useNavigate } from "react-router-dom";
import { useSEOStore } from "@/store/seoStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, ExternalLink, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Performance() {
  const navigate = useNavigate();
  const { toast } = useToast();
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

  const handleLinkClick = (url: string) => {
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }
    window.open(url, '_blank');
    toast({
      title: "Ouverture du lien",
      description: "Le lien s'ouvre dans un nouvel onglet",
    });
  };

  // Ensure arrays exist and filter out empty/invalid URLs
  const internalLinks = lastAnalysis.internal_links?.filter(link => link && link.trim() !== '') || [];
  const externalLinks = lastAnalysis.external_links?.filter(link => link && link.trim() !== '') || [];
  const brokenLinks = lastAnalysis.broken_links?.filter(link => link && link.trim() !== '') || [];

  return (
    <div className="space-y-8 pb-8">
      <h1 className="text-3xl font-bold">Performance de la page</h1>
      
      <Card className="bg-white">
        <CardContent className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">URL analysée : </h2>
            <a 
              href={lastAnalysis.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-purple-600 hover:text-purple-700 break-all"
            >
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
                className={`h-full transition-all duration-300 ${
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
              <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-blue-500" />
                    Liens internes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">
                      {internalLinks.length}
                    </p>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {internalLinks.map((link: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => handleLinkClick(link)}
                          className="text-sm text-blue-600 hover:text-blue-800 break-all text-left w-full hover:bg-gray-50 p-1 rounded flex items-center gap-2"
                        >
                          <Link2 className="h-4 w-4 shrink-0" />
                          <span>{link}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ExternalLink className="h-5 w-5 text-green-500" />
                    Liens externes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">
                      {externalLinks.length}
                    </p>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {externalLinks.map((link: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => handleLinkClick(link)}
                          className="text-sm text-green-600 hover:text-green-800 break-all text-left w-full hover:bg-gray-50 p-1 rounded flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4 shrink-0" />
                          <span>{link}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Liens cassés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">
                      {brokenLinks.length}
                    </p>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {brokenLinks.map((link: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => handleLinkClick(link)}
                          className="text-sm text-red-600 hover:text-red-800 break-all text-left w-full hover:bg-gray-50 p-1 rounded flex items-center gap-2"
                        >
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          <span>{link}</span>
                        </button>
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