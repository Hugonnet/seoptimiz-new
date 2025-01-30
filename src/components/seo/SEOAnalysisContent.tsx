import React from 'react';
import { Table, TableBody } from "@/components/ui/table";
import { SEOTableHeader } from "../SEOTableHeader";
import { SEOTableRow } from "./SEOTableRow";
import type { SEOAnalysis } from "@/store/seoStore";

interface SEOAnalysisContentProps {
  analysis: SEOAnalysis;
}

export function SEOAnalysisContent({ analysis }: SEOAnalysisContentProps) {
  return (
    <Table>
      <SEOTableHeader />
      <TableBody>
        {analysis.current_title && analysis.suggested_title && (
          <SEOTableRow
            label="Meta Title"
            current={analysis.current_title}
            suggested={analysis.suggested_title}
            context={analysis.title_context}
            fieldId={`title-${analysis.id}`}
          />
        )}

        {analysis.current_description && analysis.suggested_description && (
          <SEOTableRow
            label="Meta Description"
            current={analysis.current_description}
            suggested={analysis.suggested_description}
            context={analysis.description_context}
            fieldId={`desc-${analysis.id}`}
          />
        )}

        {analysis.current_h1 && analysis.suggested_h1 && (
          <SEOTableRow
            label="H1"
            current={analysis.current_h1}
            suggested={analysis.suggested_h1}
            context={analysis.h1_context}
            fieldId={`h1-${analysis.id}`}
          />
        )}

        {analysis.current_h2s?.map((h2, index) => (
          <SEOTableRow
            key={`h2-${index}`}
            label={`H2 #${index + 1}`}
            current={h2}
            suggested={analysis.suggested_h2s?.[index] || ''}
            context={analysis.h2s_context?.[index]}
            fieldId={`h2-${analysis.id}-${index}`}
          />
        ))}

        {analysis.current_h3s?.map((h3, index) => (
          <SEOTableRow
            key={`h3-${index}`}
            label={`H3 #${index + 1}`}
            current={h3}
            suggested={analysis.suggested_h3s?.[index] || ''}
            context={analysis.h3s_context?.[index]}
            fieldId={`h3-${analysis.id}-${index}`}
          />
        ))}

        {analysis.current_h4s?.map((h4, index) => (
          <SEOTableRow
            key={`h4-${index}`}
            label={`H4 #${index + 1}`}
            current={h4}
            suggested={analysis.suggested_h4s?.[index] || ''}
            context={analysis.h4s_context?.[index]}
            fieldId={`h4-${analysis.id}-${index}`}
          />
        ))}
      </TableBody>
    </Table>
  );
}