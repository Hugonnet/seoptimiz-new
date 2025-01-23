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
  console.log(`SEOAnalysisSection - ${title}:`, { current, suggested, context }); // Debug log

  // Pour les sections de type "single"
  if (type === 'single') {
    if (!current || current === '') {
      return null;
    }
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <HeadingComparison 
          current={current as string} 
          suggested={suggested as string} 
          context={context as string} 
        />
      </div>
    );
  }

  // Pour les sections de type "array"
  if (!Array.isArray(current) || current.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <HeadingArrayComparison 
        current={current} 
        suggested={Array.isArray(suggested) ? suggested : []} 
        context={Array.isArray(context) ? context : []} 
      />
    </div>
  );
}