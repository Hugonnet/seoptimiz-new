import React from 'react';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface HeadingComparisonProps {
  current: string;
  suggested: string;
  context?: string;
}

export function HeadingComparison({ current, suggested, context }: HeadingComparisonProps) {
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: "Texte copié dans le presse-papier",
      duration: 2000,
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 w-full">
        <div className="p-2 sm:p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="font-medium text-gray-800 mb-1.5">Version actuelle :</div>
          <div className="text-gray-600 italic break-words text-sm sm:text-base">
            {current || 'Non défini'}
          </div>
        </div>
        <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-sm border border-purple-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-1.5">
            <div className="font-medium text-purple-800">Version optimisée :</div>
            {suggested && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                onClick={() => handleCopy(suggested)}
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copier le texte optimisé</span>
              </Button>
            )}
          </div>
          <div className="text-purple-700 break-words text-sm sm:text-base">
            {suggested || 'Non défini'}
          </div>
        </div>
      </div>
      {context && (
        <div className="text-xs sm:text-sm bg-blue-50 p-2 sm:p-3 rounded-lg border border-blue-100 shadow-sm">
          <span className="font-medium text-blue-800">Explication : </span>
          <span className="text-blue-700">{context}</span>
        </div>
      )}
    </div>
  );
}