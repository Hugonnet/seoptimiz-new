import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { StickyHeader } from "@/components/StickyHeader";
import { ActionCards } from "@/components/ActionCards";
import Index from "@/pages/Index";
import History from "@/pages/History";
import ExportList from "@/pages/ExportList";
import Performance from "@/pages/Performance";
import KeywordDensity from "@/pages/KeywordDensity";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <StickyHeader />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/history" element={<History />} />
            <Route path="/export" element={<ExportList />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/keyword-density" element={<KeywordDensity />} />
          </Routes>
        </div>
        <div className="fixed bottom-0 left-0 right-0">
          <ActionCards />
        </div>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;