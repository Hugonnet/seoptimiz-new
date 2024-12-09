import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { SEOTableHeader } from "./SEOTableHeader";
import { downloadTableAsCSV } from "@/services/seoService";
import { useSEOStore } from "@/store/seoStore";
import { SEOContentSection } from "./SEOContentSection";

export function SEOTable() {
  const seoData = useSEOStore((state) => state.seoData);
  console.log("SEO Data in Table:", seoData); // Debug log

  const renderCurrentContent = (item: any) => {
    console.log("Rendering current content for item:", item);
    return (
      <div className="space-y-4">
        <SEOContentSection 
          title="Titre"
          content={item.current_title || ''}
        />
        
        <SEOContentSection 
          title="Description"
          content={item.current_description || ''}
        />
        
        <SEOContentSection 
          title="H1"
          content={item.current_h1 || ''}
        />
        
        {(item.current_h2s || []).map((h2: string, index: number) => (
          <SEOContentSection 
            key={index}
            title="H2"
            content={h2}
          />
        ))}
        
        {(item.current_h3s || []).map((h3: string, index: number) => (
          <SEOContentSection 
            key={index}
            title="H3"
            content={h3}
          />
        ))}
        
        {(item.current_h4s || []).map((h4: string, index: number) => (
          <SEOContentSection 
            key={index}
            title="H4"
            content={h4}
          />
        ))}
      </div>
    );
  };

  const renderSuggestedContent = (item: any) => {
    console.log("Rendering suggestions for item:", item);
    return (
      <div className="space-y-4">
        <SEOContentSection 
          title="Titre optimisé"
          content={item.suggested_title || ''}
        />
        
        <SEOContentSection 
          title="Description optimisée"
          content={item.suggested_description || ''}
        />
        
        <SEOContentSection 
          title="H1 optimisé"
          content={item.suggested_h1 || ''}
        />
        
        {(item.suggested_h2s || []).map((h2: string, index: number) => (
          <SEOContentSection 
            key={index}
            title="H2 optimisé"
            content={h2}
          />
        ))}
        
        {(item.suggested_h3s || []).map((h3: string, index: number) => (
          <SEOContentSection 
            key={index}
            title="H3 optimisé"
            content={h3}
          />
        ))}
        
        {(item.suggested_h4s || []).map((h4: string, index: number) => (
          <SEOContentSection 
            key={index}
            title="H4 optimisé"
            content={h4}
          />
        ))}
      </div>
    );
  };

  if (!seoData || seoData.length === 0) {
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