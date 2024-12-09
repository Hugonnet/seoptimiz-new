import { Link } from "react-router-dom";

export function Navigation() {
  return (
    <nav className="flex items-center justify-between py-6">
      <Link to="/" className="text-2xl font-bold text-[#6366F1]">
        LumenSEO
      </Link>
      
      <div className="flex gap-6">
        <Link 
          to="/analyse-approfondie" 
          className="text-gray-600 hover:text-[#6366F1] transition-colors"
        >
          Analyse Approfondie
        </Link>
        <Link 
          to="/recommandations-ia" 
          className="text-gray-600 hover:text-[#6366F1] transition-colors"
        >
          Recommandations IA
        </Link>
      </div>
    </nav>
  );
}