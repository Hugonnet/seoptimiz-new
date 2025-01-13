import React from 'react';

interface HeadingArrayComparisonProps {
  current?: string[];
  suggested?: string[];
  context?: string[];
}

export function HeadingArrayComparison({ current = [], suggested = [], context = [] }: HeadingArrayComparisonProps) {
  const validCurrentItems = Array.isArray(current) ? current.filter(item => item && item !== 'Non défini') : [];
  const validSuggestedItems = Array.isArray(suggested) ? suggested.filter(item => item && item !== 'Non défini') : [];
  const validContextItems = Array.isArray(context) ? context : [];

  if (validCurrentItems.length === 0) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {validCurrentItems.map((currentItem, index) => {
        if (!currentItem || !validSuggestedItems[index]) return null;

        return (
          <div key={index} className="space-y-3 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 w-full">
              <div className="p-2 sm:p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="font-medium text-gray-800 mb-1.5">Version actuelle :</div>
                <div className="text-gray-600 break-words text-sm sm:text-base">{currentItem}</div>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-sm border border-purple-100 hover:shadow-md transition-shadow duration-300">
                <div className="font-medium text-purple-800 mb-1.5">Version optimisée :</div>
                <div className="text-purple-700 break-words text-sm sm:text-base">{validSuggestedItems[index]}</div>
              </div>
            </div>
            {validContextItems[index] && (
              <div className="text-xs sm:text-sm bg-blue-50 p-2 sm:p-3 rounded-lg border border-blue-100 shadow-sm">
                <span className="font-medium text-blue-800">Explication : </span>
                <span className="text-blue-700">{validContextItems[index]}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}