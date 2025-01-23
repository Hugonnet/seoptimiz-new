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
  current?: string[];
  suggested?: string[];
  context?: string[];
}

export function HeadingArrayComparison({ current = [], suggested = [], context = [] }: HeadingArrayComparisonProps) {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
  
  // S'assurer que les tableaux sont bien définis et non vides
  const validCurrentItems = Array.isArray(current) ? current.filter(item => item && item.trim() !== '') : [];
  const validSuggestedItems = Array.isArray(suggested) ? suggested.filter(item => item && item.trim() !== '') : [];
  const validContextItems = Array.isArray(context) ? context.filter(item => item && item.trim() !== '') : [];

  console.log('HeadingArrayComparison - Items:', {
    current: validCurrentItems,
    suggested: validSuggestedItems,
    context: validContextItems
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
    <div className="space-y-4 sm:space-y-6">
      {validCurrentItems.map((currentItem, index) => {
        const suggestedItem = validSuggestedItems[index];
        const contextItem = validContextItems[index];

        if (!currentItem || !suggestedItem) return null;

        return (
          <div key={index} className="space-y-3 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 w-full">
              <div className="p-2 sm:p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="font-medium text-gray-800 mb-1.5">Version actuelle :</div>
                <div className="text-gray-600 break-words text-sm sm:text-base">{currentItem}</div>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-sm border border-purple-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex justify-between items-center">
                  <div className="font-medium text-purple-800 mb-1.5">Version optimisée :</div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => copyToClipboard(suggestedItem, index)}
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
                <div className="text-purple-700 break-words text-sm sm:text-base">
                  {suggestedItem}
                </div>
              </div>
            </div>
            {contextItem && contextItem.trim() !== '' && (
              <div className="text-xs sm:text-sm bg-blue-50 p-2 sm:p-3 rounded-lg border border-blue-100 shadow-sm">
                <span className="font-medium text-blue-800">Explication : </span>
                <span className="text-blue-700">{contextItem}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}