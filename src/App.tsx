import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
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
        <Navigation />
        <main className="container mx-auto py-8">
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