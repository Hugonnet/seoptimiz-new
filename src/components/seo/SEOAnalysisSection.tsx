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

  if (type === 'single') {
    if (!current || current === '') {
      console.log(`${title}: No current value`);
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

  if (!Array.isArray(current) || current.length === 0) {
    console.log(`${title}: No current array values`);
    return null;
  }

  const suggestedArray = Array.isArray(suggested) ? suggested : [];
  const contextArray = Array.isArray(context) ? context : [];

  console.log(`${title} array values:`, {
    current,
    suggestedArray,
    contextArray
  });

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <HeadingArrayComparison 
        current={current} 
        suggested={suggestedArray} 
        context={contextArray} 
      />
    </div>
  );
}