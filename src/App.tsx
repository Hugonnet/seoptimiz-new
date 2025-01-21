import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { StickyHeader } from "@/components/StickyHeader";
import Index from "@/pages/Index";
import History from "@/pages/History";
import ExportList from "@/pages/ExportList";
import KeywordDensity from "@/pages/KeywordDensity";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <StickyHeader />
        <main className="container mx-auto pt-24 pb-8 px-4">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/history" element={<History />} />
            <Route path="/export" element={<ExportList />} />
            <Route path="/keyword-density" element={<KeywordDensity />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;