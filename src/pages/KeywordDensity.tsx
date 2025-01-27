import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useSEOStore } from '@/store/seoStore';
import { Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface KeywordDensity {
  keyword: string;
  count: number;
  density: number;
}

const getKeywordScore = (density: number): { color: string; status: string; action: string } => {
  if (density < 0.5) return { 
    color: 'bg-red-500', 
    status: 'Densité trop faible', 
    action: 'Augmentez la fréquence de ce mot-clé'
  };
  if (density > 4) return { 
    color: 'bg-red-500', 
    status: 'Densité trop élevée',
    action: 'Réduisez la fréquence de ce mot-clé'
  };
  if (density >= 0.5 && density <= 2.5) return { 
    color: 'bg-green-500', 
    status: 'Densité optimale',
    action: 'Maintenir cette densité'
  };
  return { 
    color: 'bg-yellow-500', 
    status: 'Densité à surveiller',
    action: density > 2.5 ? 'Considérez réduire légèrement la fréquence' : 'Considérez augmenter légèrement la fréquence'
  };
};

export default function KeywordDensity() {
  const [isLoading, setIsLoading] = useState(false);
  const [keywordData, setKeywordData] = useState<KeywordDensity[]>([]);
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
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.keyword}</span>
                            {item.keyword.includes(' ') && (
                              <Badge variant="secondary" className="text-xs">Expression</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">
                              {item.count} occurrences ({item.density.toFixed(2)}%)
                            </span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <div className={`w-3 h-3 rounded-full ${score.color}`} />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{score.status} - {score.action}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                        <Progress value={item.density * 2} className="h-2" />
                        <p className="text-sm text-gray-600 italic">{score.action}</p>
                      </div>
                    );
                  })}
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