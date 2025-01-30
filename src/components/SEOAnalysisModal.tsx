import { SEOTableHeader } from "./SEOTableHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Copy, CopyCheck, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSEOStore } from "@/store/seoStore";
import type { SEOAnalysis } from "@/store/seoStore";
import { Table, TableBody, TableCell, TableRow } from "./ui/table";
import { useState } from "react";

interface SEOAnalysisModalProps {
  url: string;
  analyses: SEOAnalysis[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SEOAnalysisModal({ url, analyses }: SEOAnalysisModalProps) {
  const { toast } = useToast();
  const setSEOData = useSEOStore((state) => state.setSEOData);
  const seoData = useSEOStore((state) => state.seoData);
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({});

  const deleteAnalysis = async (id: number) => {
    try {
      const { error } = await supabase
        .from('seo_analyses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Mettre à jour le state local
      const updatedData = seoData.filter(item => item.id !== id);
      setSEOData(updatedData);

      toast({
        title: "Analyse supprimée",
        description: "L'analyse a été supprimée avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'analyse.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFields(prev => ({ ...prev, [fieldId]: true }));
      setTimeout(() => {
        setCopiedFields(prev => ({ ...prev, [fieldId]: false }));
      }, 2000);
      
      toast({
        title: "Copié !",
        description: "Le texte a été copié dans le presse-papier.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le texte.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analyses pour {url}</h2>
      </div>

      <div className="border rounded-lg">
        {analyses.map((analysis) => (
          <div key={analysis.id} className="space-y-4">
            <div className="bg-gray-50 p-4 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {new Date(analysis.created_at!).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={() => deleteAnalysis(analysis.id)}
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            </div>

            <ScrollArea className="h-[500px]">
              <Table>
                <SEOTableHeader />
                <TableBody>
                  {/* Meta Title */}
                  {analysis.current_title && analysis.suggested_title && (
                    <TableRow>
                      <TableCell className="align-top">
                        <div className="font-medium mb-2">Meta Title</div>
                        <div className="text-gray-600">{analysis.current_title}</div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex justify-between items-start">
                          <div className="text-green-600 flex-grow">{analysis.suggested_title}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2"
                            onClick={() => copyToClipboard(analysis.suggested_title, `title-${analysis.id}`)}
                          >
                            {copiedFields[`title-${analysis.id}`] ? (
                              <CopyCheck className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {analysis.title_context && (
                          <div className="mt-2 text-sm text-blue-600">{analysis.title_context}</div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Meta Description */}
                  {analysis.current_description && analysis.suggested_description && (
                    <TableRow>
                      <TableCell className="align-top">
                        <div className="font-medium mb-2">Meta Description</div>
                        <div className="text-gray-600">{analysis.current_description}</div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex justify-between items-start">
                          <div className="text-green-600 flex-grow">{analysis.suggested_description}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2"
                            onClick={() => copyToClipboard(analysis.suggested_description, `desc-${analysis.id}`)}
                          >
                            {copiedFields[`desc-${analysis.id}`] ? (
                              <CopyCheck className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {analysis.description_context && (
                          <div className="mt-2 text-sm text-blue-600">{analysis.description_context}</div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}

                  {/* H1 */}
                  {analysis.current_h1 && analysis.suggested_h1 && (
                    <TableRow>
                      <TableCell className="align-top">
                        <div className="font-medium mb-2">H1</div>
                        <div className="text-gray-600">{analysis.current_h1}</div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex justify-between items-start">
                          <div className="text-green-600 flex-grow">{analysis.suggested_h1}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2"
                            onClick={() => copyToClipboard(analysis.suggested_h1, `h1-${analysis.id}`)}
                          >
                            {copiedFields[`h1-${analysis.id}`] ? (
                              <CopyCheck className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {analysis.h1_context && (
                          <div className="mt-2 text-sm text-blue-600">{analysis.h1_context}</div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}

                  {/* H2s */}
                  {analysis.current_h2s && analysis.suggested_h2s && analysis.current_h2s.map((h2, index) => (
                    <TableRow key={`h2-${index}`}>
                      <TableCell className="align-top">
                        <div className="font-medium mb-2">H2 #{index + 1}</div>
                        <div className="text-gray-600">{h2}</div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex justify-between items-start">
                          <div className="text-green-600 flex-grow">{analysis.suggested_h2s[index]}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2"
                            onClick={() => copyToClipboard(analysis.suggested_h2s[index], `h2-${analysis.id}-${index}`)}
                          >
                            {copiedFields[`h2-${analysis.id}-${index}`] ? (
                              <CopyCheck className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {analysis.h2s_context && analysis.h2s_context[index] && (
                          <div className="mt-2 text-sm text-blue-600">{analysis.h2s_context[index]}</div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* H3s */}
                  {analysis.current_h3s && analysis.suggested_h3s && analysis.current_h3s.map((h3, index) => (
                    <TableRow key={`h3-${index}`}>
                      <TableCell className="align-top">
                        <div className="font-medium mb-2">H3 #{index + 1}</div>
                        <div className="text-gray-600">{h3}</div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex justify-between items-start">
                          <div className="text-green-600 flex-grow">{analysis.suggested_h3s[index]}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2"
                            onClick={() => copyToClipboard(analysis.suggested_h3s[index], `h3-${analysis.id}-${index}`)}
                          >
                            {copiedFields[`h3-${analysis.id}-${index}`] ? (
                              <CopyCheck className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {analysis.h3s_context && analysis.h3s_context[index] && (
                          <div className="mt-2 text-sm text-blue-600">{analysis.h3s_context[index]}</div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* H4s */}
                  {analysis.current_h4s && analysis.suggested_h4s && analysis.current_h4s.map((h4, index) => (
                    <TableRow key={`h4-${index}`}>
                      <TableCell className="align-top">
                        <div className="font-medium mb-2">H4 #{index + 1}</div>
                        <div className="text-gray-600">{h4}</div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex justify-between items-start">
                          <div className="text-green-600 flex-grow">{analysis.suggested_h4s[index]}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2"
                            onClick={() => copyToClipboard(analysis.suggested_h4s[index], `h4-${analysis.id}-${index}`)}
                          >
                            {copiedFields[`h4-${analysis.id}-${index}`] ? (
                              <CopyCheck className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {analysis.h4s_context && analysis.h4s_context[index] && (
                          <div className="mt-2 text-sm text-blue-600">{analysis.h4s_context[index]}</div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        ))}
      </div>
    </div>
  );
}