import React from 'react';
import { Copy, CopyCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeadingArrayComparisonProps {
  current: string[];
  suggested: string[];
  context?: string[];
}

export function HeadingArrayComparison({ current, suggested = [], context = [] }: HeadingArrayComparisonProps) {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
  
  // Vérification et nettoyage des données
  const validCurrentItems = (Array.isArray(current) ? current : []).filter(item => item && typeof item === 'string' && item.trim() !== '');
  const validSuggestedItems = (Array.isArray(suggested) ? suggested : []).filter(item => item && typeof item === 'string' && item.trim() !== '');
  const validContextItems = (Array.isArray(context) ? context : []).filter(item => item && typeof item === 'string' && item.trim() !== '');

  console.log('HeadingArrayComparison - Processed Items:', {
    validCurrentItems,
    validSuggestedItems,
    validContextItems
  });

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  if (validCurrentItems.length === 0) {
    console.log('HeadingArrayComparison: No valid current items');
    return null;
  }

  return (
    <div className="space-y-4">
      {validCurrentItems.map((currentItem, index) => (
        <div key={index} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="font-medium text-gray-800 mb-2">Version actuelle :</div>
              <div className="text-gray-600 break-words">{currentItem}</div>
            </div>
            
            {validSuggestedItems[index] && (
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-sm border border-purple-100">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium text-purple-800">Version optimisée :</div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => copyToClipboard(validSuggestedItems[index], index)}
                        >
                          {copiedIndex === index ? (
                            <CopyCheck className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-purple-600 hover:text-purple-800" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{copiedIndex === index ? 'Copié !' : 'Copier le texte'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="text-purple-700 break-words">
                  {validSuggestedItems[index]}
                </div>
              </div>
            )}
          </div>
          
          {validContextItems[index] && (
            <div className="text-sm bg-blue-50 p-4 rounded-lg border border-blue-100">
              <span className="font-medium text-blue-800">Explication : </span>
              <span className="text-blue-700">{validContextItems[index]}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}