
import React from 'react';
import { HeadingComparison } from './HeadingComparison';
import { HeadingArrayComparison } from './HeadingArrayComparison';

interface SEOAnalysisSectionProps {
  title: string;
  type: 'single' | 'array';
  current: string | string[];
  suggested: string | string[];
  context?: string | string[];
}

export function SEOAnalysisSection({ title, type, current, suggested, context }: SEOAnalysisSectionProps) {
  // Ne pas afficher la section si elle est vide
  if (type === 'single' && (!current || current === '')) {
    return null;
  }

  if (type === 'array' && (!Array.isArray(current) || current.length === 0)) {
    return null;
  }

  // Helper function to extract first string from string array context or use string directly
  const getContextString = (context: string | string[] | undefined): string | undefined => {
    if (!context) return undefined;
    if (typeof context === 'string') return context;
    if (Array.isArray(context) && context.length > 0) return context[0];
    return undefined;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      {type === 'single' ? (
        <HeadingComparison 
          current={current as string} 
          suggested={suggested as string} 
          context={getContextString(context)} 
        />
      ) : (
        <HeadingArrayComparison 
          current={current as string[]} 
          suggested={suggested as string[]} 
          context={getContextString(context)} 
        />
      )}
    </div>
  );
}
