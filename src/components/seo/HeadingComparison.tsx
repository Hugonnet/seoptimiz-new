import React from 'react';

interface HeadingComparisonProps {
  current: string;
  suggested: string;
  context?: string;
}

export function HeadingComparison({ current, suggested, context }: HeadingComparisonProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
          <div className="font-semibold text-gray-800 mb-3">Version actuelle :</div>
          <div className="text-gray-600 italic break-words text-lg">
            {current || 'Aucune balise H1 trouvée'}
          </div>
        </div>
        <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-md border border-purple-100 hover:shadow-lg transition-shadow duration-300">
          <div className="font-semibold text-purple-800 mb-3">Version optimisée :</div>
          <div className="text-purple-700 break-words text-lg">{suggested || 'Non défini'}</div>
        </div>
      </div>
      {context && (
        <div className="text-sm bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm">
          <span className="font-medium text-blue-800">Explication : </span>
          <span className="text-blue-700">{context}</span>
        </div>
      )}
    </div>
  );
}