import React from 'react';

interface HeadingComparisonProps {
  current: string;
  suggested: string;
  context?: string;
}

export function HeadingComparison({ current, suggested, context }: HeadingComparisonProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div className="p-3 bg-gray-50 rounded-lg w-full">
          <div className="font-medium text-gray-700">Version actuelle :</div>
          <div className="mt-1 text-gray-500 italic break-words">
            {current || 'Aucune balise H1 trouvée'}
          </div>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg w-full">
          <div className="font-medium text-purple-700">Version optimisée :</div>
          <div className="mt-1 text-purple-600 break-words">{suggested || 'Non défini'}</div>
        </div>
      </div>
      {context && (
        <div className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded w-full">
          Explication : {context}
        </div>
      )}
    </div>
  );
}