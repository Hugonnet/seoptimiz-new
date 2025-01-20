import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { StickyHeader } from "@/components/StickyHeader";
import { PerformanceCards } from "@/components/PerformanceCards";
import Index from "@/pages/Index";
import History from "@/pages/History";
import ExportList from "@/pages/ExportList";
import KeywordDensity from "@/pages/KeywordDensity";

function App() {
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
          <PerformanceCards />
        </main>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;