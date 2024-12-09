import React from 'react';

interface SEOContentSectionProps {
  title: string;
  content: string;
  visibleTexts?: string[];
  excludeTexts?: string[];
}

export const SEOContentSection: React.FC<SEOContentSectionProps> = ({
  title,
  content,
  visibleTexts = [],
  excludeTexts = []
}) => {
  // Filtrer les textes qui sont pertinents pour cette section
  const filteredTexts = visibleTexts
    .filter(text => 
      text && 
      text.trim() !== '' &&
      text !== content && 
      !excludeTexts.includes(text) &&
      text.length > 10  // Éviter les textes trop courts
    )
    .map(text => text.trim())
    .filter((text, index, self) => self.indexOf(text) === index); // Supprimer les doublons

  return (
    <div className="text-gray-700">
      <div className="font-semibold mb-1">{title}</div>
      <div className="mb-4 p-3 bg-purple-50 rounded-md">
        <div className="font-medium">{content}</div>
        {filteredTexts.length > 0 && (
          <div className="mt-3 space-y-2 border-t border-purple-100 pt-3">
            {filteredTexts.map((text, index) => (
              <div key={index} className="text-sm text-gray-600 pl-3 border-l-2 border-purple-200">
                {text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};