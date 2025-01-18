import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

interface KeywordDensity {
  keyword: string;
  count: number;
  density: number;
}

export default function KeywordDensity() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keywordData, setKeywordData] = useState<KeywordDensity[]>([]);
  const [totalWords, setTotalWords] = useState(0);
  const { toast } = useToast();

  const analyzeKeywords = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-keyword-density', {
        body: { url }
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

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Analyse de densité des mots clés</h1>
      
      <form onSubmit={analyzeKeywords} className="mb-8">
        <div className="flex gap-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Entrez l'URL à analyser"
            className="flex-1 px-4 py-2 border rounded-lg"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {isLoading ? 'Analyse en cours...' : 'Analyser'}
          </button>
        </div>
      </form>

      {keywordData.length > 0 && (
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
      )}
    </div>
  );
}