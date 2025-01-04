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
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{title}</h3>
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