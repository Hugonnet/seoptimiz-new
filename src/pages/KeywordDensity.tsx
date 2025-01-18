import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useSEOStore } from '@/store/seoStore';
import { Loader2 } from "lucide-react";

interface KeywordDensity {
  keyword: string;
  count: number;
  density: number;
}

export default function KeywordDensity() {
  const [isLoading, setIsLoading] = useState(false);
  const [keywordData, setKeywordData] = useState<KeywordDensity[]>([]);
  const [totalWords, setTotalWords] = useState(0);
  const { toast } = useToast();
  const seoData = useSEOStore((state) => state.seoData);

  useEffect(() => {
    const analyzeLastUrl = async () => {
      if (seoData.length === 0) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Aucune URL n'a été analysée. Veuillez d'abord analyser une URL.",
        });
        return;
      }

      const lastAnalyzedUrl = seoData[0].url;
      setIsLoading(true);

      try {
        const { data, error } = await supabase.functions.invoke('analyze-keyword-density', {
          body: { url: lastAnalyzedUrl }
        });

        if (error) throw error;

        setKeywordData(data.keywordDensity);
        setTotalWords(data.totalWords);
        
        toast({
          title: "Analyse terminée",
          description: "L'analyse de densité des mots clés a été effectuée avec succès.",
        });
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
  }, []);

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
              <div className="space-y-4">
                {keywordData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.keyword}</span>
                      <span className="text-sm text-gray-500">
                        {item.count} occurrences ({item.density.toFixed(2)}%)
                      </span>
                    </div>
                    <Progress value={item.density * 2} className="h-2" />
                  </div>
                ))}
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