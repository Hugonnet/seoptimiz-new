import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import Index from "./pages/Index";
import History from "./pages/History";
import ExportList from "./pages/ExportList";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="container mx-auto px-4 py-8">
        <Navigation />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/historique" element={<History />} />
          <Route path="/exports" element={<ExportList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;