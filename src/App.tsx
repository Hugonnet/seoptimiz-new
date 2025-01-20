import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { StickyHeader } from "@/components/StickyHeader";
import { PerformanceCards } from "@/components/PerformanceCards";
import Index from "@/pages/Index";
import History from "@/pages/History";
import ExportList from "@/pages/ExportList";
import KeywordDensity from "@/pages/KeywordDensity";
import { useSEOStore } from "@/store/seoStore";

function App() {
  const seoData = useSEOStore((state) => state.seoData);
  const lastAnalyzedUrl = seoData[0]?.url || '';

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <StickyHeader />
        <main className="container mx-auto py-8">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/history" element={<History />} />
            <Route path="/export" element={<ExportList />} />
            <Route path="/keyword-density" element={<KeywordDensity />} />
          </Routes>
          {lastAnalyzedUrl && <PerformanceCards url={lastAnalyzedUrl} />}
        </main>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;