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

  // Ne prendre que les éléments qui ont une valeur actuelle
  const validCurrentItems = current.filter(item => item && item !== 'Non défini');
  const maxLength = validCurrentItems.length;

  if (maxLength === 0) return null;

  return (
    <div className="space-y-4">
      {Array.from({ length: maxLength }).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-700">Version actuelle :</div>
              <div className="mt-1">{validCurrentItems[index] || 'Non défini'}</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="font-medium text-purple-700">Version optimisée :</div>
              <div className="mt-1 text-purple-600">{suggested[index] || 'Non défini'}</div>
            </div>
          </div>
          {context[index] && (
            <div className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded">
              Explication : {context[index]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}