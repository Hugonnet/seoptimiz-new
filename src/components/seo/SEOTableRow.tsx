import React, { useState } from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Copy, CopyCheck } from "lucide-react";

interface SEOTableRowProps {
  label: string;
  current: string;
  suggested: string;
  context?: string;
  fieldId: string;
}

export function SEOTableRow({ label, current, suggested, context, fieldId }: SEOTableRowProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(suggested);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  return (
    <TableRow className="hover:bg-purple-50/50 transition-colors">
      <TableCell className="align-top bg-purple-50/30">
        <div className="font-medium mb-2">{label}</div>
        <div className="text-gray-600">{current}</div>
      </TableCell>
      <TableCell className="align-top bg-pink-50/30">
        <div className="flex justify-between items-start">
          <div className="text-purple-700 flex-grow">{suggested}</div>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 hover:bg-purple-100"
            onClick={copyToClipboard}
          >
            {copied ? (
              <CopyCheck className="h-4 w-4 text-purple-500" />
            ) : (
              <Copy className="h-4 w-4 text-purple-400 hover:text-purple-600" />
            )}
          </Button>
        </div>
        {context && (
          <div className="mt-2 text-sm text-purple-600 italic">{context}</div>
        )}
      </TableCell>
    </TableRow>
  );
}