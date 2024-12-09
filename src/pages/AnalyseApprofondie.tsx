import { Navigation } from "@/components/Navigation";
import { URLForm } from "@/components/URLForm";
import { SEOTable } from "@/components/SEOTable";

const AnalyseApprofondie = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-[#FFFFFF] p-6">
      <div className="max-w-7xl mx-auto">
        <Navigation />
        
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-[#6366F1]">Analyse SEO Approfondie</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Obtenez une analyse détaillée de votre page web avec des recommandations d'optimisation personnalisées par notre expert SEO.
            </p>
          </div>

          <URLForm />
          <SEOTable />
        </div>
      </div>
    </div>
  );
};

export default AnalyseApprofondie;