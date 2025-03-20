
import React from 'react';
import { removeProtectionPatterns } from '@/services/seoService';

interface HeadingArrayComparisonProps {
  current: string[];
  suggested?: string[];
  context?: string;
}

export function HeadingArrayComparison({ current, suggested, context }: HeadingArrayComparisonProps) {
  // Clean all headings using the enhanced protection pattern removal
  const cleanCurrentHeadings = current ? current.map(heading => removeProtectionPatterns(heading)).filter(Boolean) : [];
  const cleanSuggestedHeadings = suggested ? suggested.map(heading => removeProtectionPatterns(heading)).filter(Boolean) : [];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 w-full">
        <div className="p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="font-medium text-gray-800 mb-2">Versions actuelles :</div>
          {cleanCurrentHeadings.length === 0 ? (
            <div className="text-gray-600 italic">Non définis</div>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {cleanCurrentHeadings.map((heading, index) => (
                <li key={index} className="text-gray-600 text-sm sm:text-base">
                  {heading}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-sm border border-purple-100 hover:shadow-md transition-shadow duration-300">
          <div className="font-medium text-purple-800 mb-2">Versions optimisées :</div>
          {cleanSuggestedHeadings && cleanSuggestedHeadings.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {cleanSuggestedHeadings.map((heading, index) => (
                <li key={index} className="text-purple-700 text-sm sm:text-base">
                  {heading}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-purple-700 italic">Non proposés</div>
          )}
        </div>
      </div>
      {context && (
        <div className="text-xs sm:text-sm bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100 shadow-sm">
          <span className="font-medium text-blue-800">Explication : </span>
          <span className="text-blue-700">{context}</span>
        </div>
      )}
    </div>
  );
}
