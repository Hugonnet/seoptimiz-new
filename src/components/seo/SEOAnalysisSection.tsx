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
  console.log(`SEOAnalysisSection - ${title}:`, { type, current, suggested, context });

  if (type === 'single') {
    if (!current || typeof current !== 'string' || current.trim() === '') {
      console.log(`SEOAnalysisSection - ${title}: Skipping single type due to invalid current value`);
      return null;
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <HeadingComparison 
          current={current} 
          suggested={suggested as string} 
          context={context as string} 
        />
      </div>
    );
  }

  // Vérification pour le type array
  if (!Array.isArray(current)) {
    console.log(`SEOAnalysisSection - ${title}: Current is not an array`, current);
    return null;
  }

  // Filtrer les éléments vides ou undefined
  const validCurrentItems = current.filter(item => item && typeof item === 'string' && item.trim() !== '');
  
  if (validCurrentItems.length === 0) {
    console.log(`SEOAnalysisSection - ${title}: No valid items in current array`);
    return null;
  }

  const suggestedArray = Array.isArray(suggested) ? suggested : [];
  const contextArray = Array.isArray(context) ? context : [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <HeadingArrayComparison 
        current={validCurrentItems} 
        suggested={suggestedArray} 
        context={contextArray} 
      />
    </div>
  );
}