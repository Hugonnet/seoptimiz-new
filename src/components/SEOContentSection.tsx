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
      <div className="font-semibold mb-1">{title} :</div>
      <div className="mb-2 p-2 bg-purple-50 rounded-md">{content}</div>
      {filteredTexts.length > 0 && (
        <div className="ml-4 space-y-2">
          <div className="text-sm text-gray-500 italic mb-1">Textes associés :</div>
          {filteredTexts.map((text, index) => (
            <div key={index} className="p-2 bg-gray-50 rounded-md text-sm">
              {text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};