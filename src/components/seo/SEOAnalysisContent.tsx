
import React from 'react';
import { Table, TableBody } from "@/components/ui/table";
import type { SEOAnalysis } from "@/store/seoStore";
import { HeadingComparison } from './HeadingComparison';
import { HeadingArrayComparison } from './HeadingArrayComparison';
import { Copy, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface SEOAnalysisContentProps {
  analysis: SEOAnalysis;
  onCopy?: (type: 'title' | 'description' | 'h1') => void;
}

export function SEOAnalysisContent({ analysis, onCopy }: SEOAnalysisContentProps) {
  // Check if this is a bot protection page (looking for indicators in the company name or contexts)
  const isBotProtectionPage = 
    (analysis.company && analysis.company.includes("Protection anti-bot détectée")) ||
    (analysis.title_context && analysis.title_context.includes("page de protection anti-bot")) ||
    (analysis.description_context && analysis.description_context.includes("page de protection anti-bot"));

  // Helper function to extract first string from string array context or use string directly
  const getContextString = (context: string | string[] | undefined): string | undefined => {
    if (!context) return undefined;
    if (typeof context === 'string') return context;
    if (Array.isArray(context) && context.length > 0) return context[0];
    return undefined;
  };

  return (
    <div className="space-y-8">
      {isBotProtectionPage && (
        <Alert variant="destructive" className="mb-6 border-2 border-red-500">
          <div className="flex items-start">
            <Shield className="h-6 w-6 mt-1 text-red-500" />
            <div className="ml-3">
              <AlertTitle className="text-lg font-bold mb-2">⚠️ Attention : Protection anti-bot détectée</AlertTitle>
              <AlertDescription className="text-base">
                <p className="mb-2 font-semibold">
                  Les données récupérées proviennent d'une page de protection anti-bot, et non du contenu réel du site.
                </p>
                <p className="mb-2">
                  Les suggestions ci-dessous sont basées sur cette page de protection et ne reflètent pas le contenu original du site web.
                </p>
                <div className="mt-4 bg-red-50 p-3 rounded-md">
                  <strong>Solutions possibles :</strong>
                  <ul className="list-disc pl-5 pt-2">
                    <li>Essayer d'analyser à nouveau le site après un certain temps</li>
                    <li>Utiliser un autre navigateur ou une connexion différente</li>
                    <li>Contacter le propriétaire du site pour obtenir l'accès</li>
                  </ul>
                </div>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-6 mb-4">
        <h3 className="text-lg font-semibold text-purple-700">Dénominations actuelles</h3>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-purple-700">Améliorations suggérées par I.A</h3>
        </div>
      </div>

      <div className="space-y-8">
        {(analysis.current_title || analysis.suggested_title) && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-6">
              <div className="font-medium text-gray-700">Meta Title</div>
              <div className="flex items-center justify-between">
                <div className="font-medium text-purple-700">Meta Title suggéré</div>
                {onCopy && (
                  <Button variant="ghost" size="sm" onClick={() => onCopy('title')} className="text-purple-600 hover:text-purple-800">
                    <Copy className="h-4 w-4 mr-1" /> Copier
                  </Button>
                )}
              </div>
            </div>
            <HeadingComparison
              current={analysis.current_title || "Non défini"}
              suggested={analysis.suggested_title}
              context={getContextString(analysis.title_context)}
            />
          </div>
        )}

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-6">
            <div className="font-medium text-gray-700">Meta Description</div>
            <div className="flex items-center justify-between">
              <div className="font-medium text-purple-700">Meta Description suggérée</div>
              {onCopy && (
                <Button variant="ghost" size="sm" onClick={() => onCopy('description')} className="text-purple-600 hover:text-purple-800">
                  <Copy className="h-4 w-4 mr-1" /> Copier
                </Button>
              )}
            </div>
          </div>
          <HeadingComparison
            current={analysis.current_description || "Non définie"}
            suggested={analysis.suggested_description}
            context={getContextString(analysis.description_context)}
          />
        </div>

        {(analysis.current_h1 || analysis.suggested_h1) && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-6">
              <div className="font-medium text-gray-700">H1</div>
              <div className="flex items-center justify-between">
                <div className="font-medium text-purple-700">H1 suggéré</div>
                {onCopy && (
                  <Button variant="ghost" size="sm" onClick={() => onCopy('h1')} className="text-purple-600 hover:text-purple-800">
                    <Copy className="h-4 w-4 mr-1" /> Copier
                  </Button>
                )}
              </div>
            </div>
            <HeadingComparison
              current={analysis.current_h1 || "Non défini"}
              suggested={analysis.suggested_h1}
              context={getContextString(analysis.h1_context)}
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
              context={getContextString(analysis.h2s_context)}
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
              context={getContextString(analysis.h3s_context)}
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
              context={getContextString(analysis.h4s_context)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
