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
  const filteredTexts = visibleTexts.filter(text => 
    text && 
    text !== content && 
    !excludeTexts.includes(text)
  );

  return (
    <div className="text-gray-700">
      <div className="font-semibold mb-1">{title} :</div>
      <div className="mb-2">{content}</div>
      {filteredTexts.map((text, index) => (
        <div key={index} className="mt-2 p-2 bg-gray-50 rounded-md">
          {text}
        </div>
      ))}
    </div>
  );
};