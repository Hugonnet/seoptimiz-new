
import React from 'react';
import { Copy, CopyCheck, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { removeProtectionPatterns } from '@/services/seoService';

interface HeadingComparisonProps {
  current: string;
  suggested: string;
  context?: string;
}

export function HeadingComparison({ current, suggested, context }: HeadingComparisonProps) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(suggested || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Apply ultra-aggressive cleaning to both current and suggested values
  const cleanCurrent = current ? removeProtectionPatterns(current) : 'Non défini';
  const cleanSuggested = suggested ? removeProtectionPatterns(suggested) : 'Non défini';
  
  // Check if this appears to be a bot protection page
  const isBotProtectionPage = 
    (cleanCurrent && cleanCurrent.toLowerCase().includes('bot verification')) ||
    (cleanCurrent && cleanCurrent.toLowerCase().includes('captcha')) ||
    (cleanCurrent && cleanCurrent.toLowerCase().includes('cloudflare')) ||
    (cleanCurrent && cleanCurrent.toLowerCase().includes('security check'));

  // Determine if context includes bot protection warning
  const hasBotProtectionWarning = context && context.toLowerCase().includes('page de protection anti-bot');

  // Get a simplified version for display - cut off at first numeric sequence to be ultra safe
  const getSimplifiedDisplay = (text: string): string => {
    if (!text || text === 'Non défini') return text;
    
    // Last resort: if all else fails, just use the first part of the string before any numbers
    const firstPart = text.split(/\d/).filter(Boolean)[0];
    if (firstPart && firstPart.trim().length > 5) {
      return firstPart.trim();
    }
    
    return text.length > 10 ? text.substring(0, 10) + '...' : text;
  };

  // The final cleaned text to display
  const finalCurrentDisplay = isBotProtectionPage ? getSimplifiedDisplay(cleanCurrent) : cleanCurrent;
  
  return (
    <div className="space-y-3">
      {isBotProtectionPage && !hasBotProtectionWarning && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            Le contenu récupéré semble être une page de protection anti-bot, et non le contenu réel du site. 
            Les suggestions ne reflètent pas le contenu original du site web.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 w-full">
        <div className="p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="font-medium text-gray-800 mb-2">Version actuelle :</div>
          <div className="text-gray-600 italic break-words text-sm sm:text-base">
            {finalCurrentDisplay}
          </div>
        </div>
        <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-sm border border-purple-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center">
            <div className="font-medium text-purple-800 mb-2">Version optimisée :</div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <CopyCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-purple-600 hover:text-purple-800" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copied ? 'Copié !' : 'Copier le texte'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-purple-700 break-words text-sm sm:text-base">
            {cleanSuggested}
          </div>
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
