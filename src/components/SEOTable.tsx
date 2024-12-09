import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { SEOTableHeader } from "./SEOTableHeader";
import { downloadTableAsCSV } from "@/services/seoService";
import { useSEOStore } from "@/store/seoStore";
import { SEOContentSection } from "./SEOContentSection";

export function SEOTable() {
  const seoData = useSEOStore((state) => state.seoData);

  const renderCurrentContent = (item: any) => (
    <div className="space-y-4">
      <SEOContentSection 
        title="Titre"
        content={item.current_title}
      />
      
      <SEOContentSection 
        title="Description"
        content={item.current_description}
      />
      
      <SEOContentSection 
        title="H1"
        content={item.current_h1}
        visibleTexts={item.visible_text}
        excludeTexts={[
          ...(item.current_h2s || []),
          ...(item.current_h3s || []),
          ...(item.current_h4s || [])
        ]}
      />
      
      {item.current_h2s?.map((h2: string, index: number) => (
        <SEOContentSection 
          key={index}
          title="H2"
          content={h2}
          visibleTexts={item.visible_text}
          excludeTexts={[
            h2,
            ...(item.current_h3s || []),
            ...(item.current_h4s || [])
          ]}
        />
      ))}
      
      {item.current_h3s?.map((h3: string, index: number) => (
        <SEOContentSection 
          key={index}
          title="H3"
          content={h3}
          visibleTexts={item.visible_text}
          excludeTexts={[
            h3,
            ...(item.current_h4s || [])
          ]}
        />
      ))}
      
      {item.current_h4s?.map((h4: string, index: number) => (
        <SEOContentSection 
          key={index}
          title="H4"
          content={h4}
          visibleTexts={item.visible_text}
          excludeTexts={[h4]}
        />
      ))}
    </div>
  );

  const renderSuggestedContent = (item: any) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="font-bold text-purple-600">Titre optimisé :</div>
        <div>{item.suggested_title}</div>
        <div className="text-sm text-gray-600 italic">{item.title_context}</div>
      </div>
      
      <div className="space-y-2">
        <div className="font-bold text-purple-600">Description optimisée :</div>
        <div>{item.suggested_description}</div>
        <div className="text-sm text-gray-600 italic">{item.description_context}</div>
      </div>
      
      <div className="space-y-2">
        <div className="font-bold text-purple-600">H1 optimisé :</div>
        <div>{item.suggested_h1}</div>
        <div className="text-sm text-gray-600 italic">{item.h1_context}</div>
      </div>
      
      {item.suggested_h2s?.map((h2: string, index: number) => (
        <div key={index} className="space-y-2">
          <div className="font-bold text-purple-600">H2 optimisé :</div>
          <div>{h2}</div>
          <div className="text-sm text-gray-600 italic">{item.h2s_context?.[index]}</div>
        </div>
      ))}
      
      {item.suggested_h3s?.map((h3: string, index: number) => (
        <div key={index} className="space-y-2">
          <div className="font-bold text-purple-600">H3 optimisé :</div>
          <div>{h3}</div>
          <div className="text-sm text-gray-600 italic">{item.h3s_context?.[index]}</div>
        </div>
      ))}
      
      {item.suggested_h4s?.map((h4: string, index: number) => (
        <div key={index} className="space-y-2">
          <div className="font-bold text-purple-600">H4 optimisé :</div>
          <div>{h4}</div>
          <div className="text-sm text-gray-600 italic">{item.h4s_context?.[index]}</div>
        </div>
      ))}
      
      {item.visible_text && (
        <div className="space-y-2">
          <div className="font-bold text-purple-600">Contenu textuel optimisé :</div>
          <div className="space-y-2">
            {Array.isArray(item.suggested_visible_text) ? (
              item.suggested_visible_text.map((text: string, index: number) => (
                <div key={index} className="p-2 bg-purple-50 rounded-md">
                  {text}
                  {item.visible_text_context?.[index] && (
                    <div className="text-sm text-gray-600 italic mt-1">
                      {item.visible_text_context[index]}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="italic text-gray-500">Aucune suggestion disponible</div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (seoData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 bg-white rounded-xl shadow-sm border border-gray-100">
        Aucune donnée SEO disponible. Analysez une URL pour commencer.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {seoData.map((item) => (
        <div key={item.id} className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-600 mb-4">
            Analyse SEO pour : <span className="text-gray-700">{item.url}</span>
          </h2>
          
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <Table>
              <SEOTableHeader />
              <TableBody>
                <TableRow className="hover:bg-gray-50/50">
                  <TableCell className="align-top">{renderCurrentContent(item)}</TableCell>
                  <TableCell className="align-top">{renderSuggestedContent(item)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => downloadTableAsCSV(seoData)} variant="outline" className="gap-2 gradient-button">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
