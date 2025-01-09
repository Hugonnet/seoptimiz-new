import React from 'react';

interface HeadingArrayComparisonProps {
  current?: string[];
  suggested?: string[];
  context?: string[];
}

export function HeadingArrayComparison({ current = [], suggested = [], context = [] }: HeadingArrayComparisonProps) {
  if (!Array.isArray(current) || !Array.isArray(suggested)) {
    return null;
  }

  const validCurrentItems = current.filter(item => item && item !== 'Non défini');
  const validSuggestedItems = suggested.filter(item => item && item !== 'Non défini');

  if (validCurrentItems.length === 0) return null;

  return (
    <div className="space-y-6">
      {validCurrentItems.map((currentItem, index) => {
        if (!validSuggestedItems[index]) return null;

        return (
          <div key={index} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="p-3 bg-gray-50 rounded-lg w-full">
                <div className="font-medium text-gray-700">Version actuelle :</div>
                <div className="mt-1 break-words">{currentItem}</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg w-full">
                <div className="font-medium text-purple-700">Version optimisée :</div>
                <div className="mt-1 text-purple-600 break-words">{validSuggestedItems[index]}</div>
              </div>
            </div>
            {context[index] && (
              <div className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded w-full">
                Explication : {context[index]}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}