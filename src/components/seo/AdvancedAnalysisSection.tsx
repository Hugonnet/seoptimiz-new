import { ReadabilityScore } from "./metrics/ReadabilityScore";
import { ContentLength } from "./metrics/ContentLength";
import { LinksAnalysis } from "./metrics/LinksAnalysis";
import { PagePerformance } from "./metrics/PagePerformance";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "lucide-react";

interface AdvancedAnalysisSectionProps {
  readabilityScore?: number;
  contentLength?: number;
  internalLinks?: string[];
  externalLinks?: string[];
  brokenLinks?: string[];
  imageAlts?: Record<string, string>;
  pageLoadSpeed?: number;
  mobileFriendly?: boolean;
}

export function AdvancedAnalysisSection({
  readabilityScore = 0,
  contentLength = 0,
  internalLinks = [],
  externalLinks = [],
  brokenLinks = [],
  imageAlts = {},
  pageLoadSpeed = 0,
  mobileFriendly = true,
}: AdvancedAnalysisSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-purple-800">Analyse technique avancée</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReadabilityScore score={readabilityScore} />
        <ContentLength length={contentLength} />
        <LinksAnalysis 
          internalLinks={internalLinks}
          externalLinks={externalLinks}
          brokenLinks={brokenLinks}
        />
        <PagePerformance 
          loadSpeed={pageLoadSpeed}
          isMobileFriendly={mobileFriendly}
        />

        {Object.keys(imageAlts).length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Textes alternatifs des images</CardTitle>
              <CardDescription>Accessibilité des images</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(imageAlts).map(([src, alt], index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Image className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">{alt}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}