import { Navigation } from "@/components/Navigation";
import { SEOTable } from "@/components/SEOTable";
import { useSEOStore } from "@/store/seoStore";

const RecommandationsIA = () => {
  const seoData = useSEOStore((state) => state.seoData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-[#FFFFFF] p-6">
      <div className="max-w-7xl mx-auto">
        <Navigation />
        
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-[#6366F1]">Recommandations IA</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez les suggestions d'optimisation générées par notre intelligence artificielle spécialisée en SEO.
            </p>
          </div>

          <SEOTable />
        </div>
      </div>
    </div>
  );
};

export default RecommandationsIA;