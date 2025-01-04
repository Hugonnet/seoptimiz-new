import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { SEOTableHeader } from "./SEOTableHeader";
import { downloadTableAsCSV } from "@/services/seoService";
import { useSEOStore } from "@/store/seoStore";

export function SEOTable() {
  const seoData = useSEOStore((state) => state.seoData);

  const renderHeadingComparison = (current: string, suggested: string, context: string) => (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="font-medium text-gray-700">Version actuelle :</div>
          <div className="mt-1">{current}</div>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="font-medium text-purple-700">Version optimisée :</div>
          <div className="mt-1 text-purple-600">{suggested}</div>
        </div>
      </div>
      {context && (
        <div className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded">
          Explication : {context}
        </div>
      )}
    </div>
  );

  const renderHeadingArrayComparison = (current: string[], suggested: string[], context: string[]) => (
    <div className="space-y-4">
      {current.map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-700">Version actuelle :</div>
              <div className="mt-1">{current[index]}</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="font-medium text-purple-700">Version optimisée :</div>
              <div className="mt-1 text-purple-600">{suggested[index]}</div>
            </div>
          </div>
          {context[index] && (
            <div className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded">
              Explication : {context[index]}
            </div>
          )}
        </div>
      ))}
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
            <div className="p-6 space-y-8">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Balise Title</h3>
                {renderHeadingComparison(item.current_title, item.suggested_title, item.title_context)}
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Meta Description</h3>
                {renderHeadingComparison(item.current_description, item.suggested_description, item.description_context)}
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-semibold">H1</h3>
                {renderHeadingComparison(item.current_h1, item.suggested_h1, item.h1_context)}
              </div>

              {item.current_h2s?.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">H2</h3>
                  {renderHeadingArrayComparison(item.current_h2s, item.suggested_h2s, item.h2s_context)}
                </div>
              )}

              {item.current_h3s?.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">H3</h3>
                  {renderHeadingArrayComparison(item.current_h3s, item.suggested_h3s, item.h3s_context)}
                </div>
              )}

              {item.current_h4s?.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">H4</h3>
                  {renderHeadingArrayComparison(item.current_h4s, item.suggested_h4s, item.h4s_context)}
                </div>
              )}
            </div>
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