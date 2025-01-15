import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link2, AlertTriangle, Image, Smartphone, Gauge } from "lucide-react";

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
        {/* Score de lisibilité */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Score de lisibilité</CardTitle>
            <CardDescription>Facilité de lecture du contenu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={readabilityScore} className="h-2" />
              <p className="text-sm text-gray-600">{readabilityScore}/100</p>
            </div>
          </CardContent>
        </Card>

        {/* Longueur du contenu */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Longueur du contenu</CardTitle>
            <CardDescription>Nombre de mots</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{contentLength}</p>
          </CardContent>
        </Card>

        {/* Liens */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Analyse des liens</CardTitle>
            <CardDescription>État des liens de la page</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-blue-500" />
                  Liens internes
                </span>
                <Badge variant="outline">{internalLinks?.length || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-green-500" />
                  Liens externes
                </span>
                <Badge variant="outline">{externalLinks?.length || 0}</Badge>
              </div>
              {brokenLinks && brokenLinks.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-red-500">
                    <AlertTriangle className="h-4 w-4" />
                    Liens cassés
                  </span>
                  <Badge variant="destructive">{brokenLinks.length}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vitesse de chargement</CardTitle>
            <CardDescription>Performance de la page</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Gauge className="h-5 w-5 text-purple-600" />
              <div className="space-y-1">
                <Progress value={pageLoadSpeed} className="h-2" />
                <p className="text-sm text-gray-600">{pageLoadSpeed}s</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Friendly */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compatibilité mobile</CardTitle>
            <CardDescription>Adaptation aux appareils mobiles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Smartphone className={`h-5 w-5 ${mobileFriendly ? 'text-green-500' : 'text-red-500'}`} />
              <span className={mobileFriendly ? 'text-green-600' : 'text-red-600'}>
                {mobileFriendly ? 'Compatible' : 'Non compatible'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Images Alt */}
        {imageAlts && Object.keys(imageAlts).length > 0 && (
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