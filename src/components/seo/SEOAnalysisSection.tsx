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
  if (!current || (Array.isArray(current) && current.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {type === 'single' ? (
        <HeadingComparison 
          current={current as string} 
          suggested={suggested as string} 
          context={context as string} 
        />
      ) : (
        <HeadingArrayComparison 
          current={current as string[]} 
          suggested={suggested as string[]} 
          context={context as string[]} 
        />
      )}
    </div>
  );
}