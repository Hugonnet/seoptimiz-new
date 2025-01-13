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
    <div className="space-y-6 sm:space-y-8">
      {validCurrentItems.map((currentItem, index) => {
        if (!currentItem || !validSuggestedItems[index]) return null;

        return (
          <div key={index} className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 w-full">
              <div className="p-3 sm:p-4 lg:p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                <div className="font-semibold text-gray-800 mb-2 sm:mb-3">Version actuelle :</div>
                <div className="text-gray-600 break-words text-base sm:text-lg">{currentItem}</div>
              </div>
              <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-md border border-purple-100 hover:shadow-lg transition-shadow duration-300">
                <div className="font-semibold text-purple-800 mb-2 sm:mb-3">Version optimisée :</div>
                <div className="text-purple-700 break-words text-base sm:text-lg">{validSuggestedItems[index]}</div>
              </div>
            </div>
            {validContextItems[index] && (
              <div className="text-sm bg-blue-50 p-3 sm:p-4 rounded-xl border border-blue-100 shadow-sm">
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