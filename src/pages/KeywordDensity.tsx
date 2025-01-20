import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useSEOStore } from '@/store/seoStore';
import { Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface KeywordDensity {
  keyword: string;
  count: number;
  density: number;
}

interface LinkData {
  internal: string[];
  external: string[];
}

const getKeywordScore = (density: number): { color: string; status: string } => {
  if (density < 0.5) return { color: 'bg-red-500', status: 'Densité trop faible' };
  if (density > 4) return { color: 'bg-red-500', status: 'Densité trop élevée' };
  if (density >= 0.5 && density <= 2.5) return { color: 'bg-green-500', status: 'Densité optimale' };
  return { color: 'bg-yellow-500', status: 'Densité à surveiller' };
};

const getLinkScore = (links: string[]): { color: string; status: string } => {
  const count = links.length;
  if (count === 0) return { color: 'bg-red-500', status: 'Aucun lien' };
  if (count > 100) return { color: 'bg-red-500', status: 'Trop de liens' };
  if (count >= 2 && count <= 100) return { color: 'bg-green-500', status: 'Nombre optimal' };
  return { color: 'bg-yellow-500', status: 'À améliorer' };
};

export default function KeywordDensity() {
  const [isLoading, setIsLoading] = useState(false);
  const [keywordData, setKeywordData] = useState<KeywordDensity[]>([]);
  const [linkData, setLinkData] = useState<LinkData>({ internal: [], external: [] });
  const [totalWords, setTotalWords] = useState(0);
  const { toast } = useToast();
  const seoData = useSEOStore((state) => state.seoData);
  const navigate = useNavigate();

  useEffect(() => {
    const analyzeLastUrl = async () => {
      if (!seoData || seoData.length === 0) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Aucune URL n'a été analysée. Veuillez d'abord analyser une URL.",
        });
        navigate('/');
        return;
      }

      const lastAnalysis = seoData[0];
      setIsLoading(true);

      try {
        const response = await supabase.functions.invoke('analyze-keyword-density', {
          body: { url: lastAnalysis.url }
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        if (response.data && response.data.keywordDensity) {
          const cleanedData = response.data.keywordDensity
            .map((item: KeywordDensity) => ({
              ...item,
              keyword: item.keyword.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '')
            }))
            .filter((item: KeywordDensity) => item.keyword.length > 0);
          
          setKeywordData(cleanedData);
          setTotalWords(response.data.totalWords);
          
          // Set link data from the last analysis
          setLinkData({
            internal: lastAnalysis.internal_links || [],
            external: lastAnalysis.external_links || []
          });
          
          toast({
            title: "Analyse terminée",
            description: "L'analyse de densité des mots clés a été effectuée avec succès.",
          });
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur est survenue lors de l'analyse des mots clés.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    analyzeLastUrl();
  }, [seoData, toast, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <p className="mt-4 text-gray-600">Analyse en cours...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Analyse de densité des mots clés</h1>
      
      {keywordData.length > 0 ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Résultats de l'analyse</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Nombre total de mots : {totalWords}</p>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Densité des mots clés</h3>
                  {keywordData.map((item, index) => {
                    const score = getKeywordScore(item.density);
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{item.keyword}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">
                              {item.count} occurrences ({item.density.toFixed(2)}%)
                            </span>
                            <div 
                              className={`w-3 h-3 rounded-full ${score.color}`} 
                              title={score.status}
                            />
                          </div>
                        </div>
                        <Progress value={item.density * 2} className="h-2" />
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-lg font-semibold">Analyse des liens</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Liens internes</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                          {linkData.internal.length} liens
                        </span>
                        <div 
                          className={`w-3 h-3 rounded-full ${getLinkScore(linkData.internal).color}`}
                          title={getLinkScore(linkData.internal).status}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Liens externes</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                          {linkData.external.length} liens
                        </span>
                        <div 
                          className={`w-3 h-3 rounded-full ${getLinkScore(linkData.external).color}`}
                          title={getLinkScore(linkData.external).status}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-600">
              Aucune donnée d'analyse disponible.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}