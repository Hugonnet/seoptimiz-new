
import React from 'react';
import { Table, TableBody } from "@/components/ui/table";
import type { SEOAnalysis } from "@/store/seoStore";
import { HeadingComparison } from './HeadingComparison';
import { HeadingArrayComparison } from './HeadingArrayComparison';

interface SEOAnalysisContentProps {
  analysis: SEOAnalysis;
}

export function SEOAnalysisContent({ analysis }: SEOAnalysisContentProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-6 mb-4">
        <h3 className="text-lg font-semibold text-purple-700">Dénominations actuelles</h3>
        <h3 className="text-lg font-semibold text-purple-700">Améliorations suggérées par I.A</h3>
      </div>

      <div className="space-y-8">
        {(analysis.current_title || analysis.suggested_title) && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-6">
              <div className="font-medium text-gray-700">Meta Title</div>
              <div className="font-medium text-purple-700">Meta Title suggéré</div>
            </div>
            <HeadingComparison
              current={analysis.current_title || "Non défini"}
              suggested={analysis.suggested_title}
              context={analysis.title_context}
            />
          </div>
        )}

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-6">
            <div className="font-medium text-gray-700">Meta Description</div>
            <div className="font-medium text-purple-700">Meta Description suggérée</div>
          </div>
          <HeadingComparison
            current={analysis.current_description || "Non définie"}
            suggested={analysis.suggested_description}
            context={analysis.description_context}
          />
        </div>

        {(analysis.current_h1 || analysis.suggested_h1) && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-6">
              <div className="font-medium text-gray-700">H1</div>
              <div className="font-medium text-purple-700">H1 suggéré</div>
            </div>
            <HeadingComparison
              current={analysis.current_h1 || "Non défini"}
              suggested={analysis.suggested_h1}
              context={analysis.h1_context}
            />
          </div>
        )}

        {analysis.current_h2s?.length > 0 && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-6">
              <div className="font-medium text-gray-700">H2</div>
              <div className="font-medium text-purple-700">H2 suggérés</div>
            </div>
            <HeadingArrayComparison
              current={analysis.current_h2s}
              suggested={analysis.suggested_h2s}
              context={analysis.h2s_context}
            />
          </div>
        )}

        {analysis.current_h3s?.length > 0 && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-6">
              <div className="font-medium text-gray-700">H3</div>
              <div className="font-medium text-purple-700">H3 suggérés</div>
            </div>
            <HeadingArrayComparison
              current={analysis.current_h3s}
              suggested={analysis.suggested_h3s}
              context={analysis.h3s_context}
            />
          </div>
        )}

        {analysis.current_h4s?.length > 0 && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-6">
              <div className="font-medium text-gray-700">H4</div>
              <div className="font-medium text-purple-700">H4 suggérés</div>
            </div>
            <HeadingArrayComparison
              current={analysis.current_h4s}
              suggested={analysis.suggested_h4s}
              context={analysis.h4s_context}
            />
          </div>
        )}
      </div>
    </div>
  );
}
