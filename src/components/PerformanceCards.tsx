import React from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Gauge, Upload, Download, Timer } from "lucide-react";

interface PerformanceCardsProps {
  url: string;
}

export const PerformanceCards: React.FC<PerformanceCardsProps> = ({ url }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-8">
      <Card className="p-4 md:p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
            <Timer className="w-5 h-5 text-[#6366F1]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Temps de chargement</h3>
            <p className="text-sm text-gray-500">2.3 secondes</p>
          </div>
        </div>
        <Progress value={75} className="h-2" />
      </Card>

      <Card className="p-4 md:p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
            <Gauge className="w-5 h-5 text-[#6366F1]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Performance globale</h3>
            <p className="text-sm text-gray-500">85/100</p>
          </div>
        </div>
        <Progress value={85} className="h-2" />
      </Card>

      <Card className="p-4 md:p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
            <Upload className="w-5 h-5 text-[#6366F1]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Vitesse d'envoi</h3>
            <p className="text-sm text-gray-500">15 Mb/s</p>
          </div>
        </div>
        <Progress value={60} className="h-2" />
      </Card>

      <Card className="p-4 md:p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
            <Download className="w-5 h-5 text-[#6366F1]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Vitesse de réception</h3>
            <p className="text-sm text-gray-500">45 Mb/s</p>
          </div>
        </div>
        <Progress value={90} className="h-2" />
      </Card>
    </div>
  );
};