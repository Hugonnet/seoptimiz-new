import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface SEOResult {
  url: string;
  title: string;
  description: string;
  h1: string;
  suggestions: string[];
  status: "success" | "error" | "warning";
}

const Index = () => {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SEOResult | null>(null);
  const { toast } = useToast();

  const analyzeSEO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      setResult({
        url,
        title: "Example Page Title",
        description: "This is an example meta description that needs optimization.",
        h1: "Welcome to Example Website",
        suggestions: [
          "Add more relevant keywords to your title",
          "Extend your meta description to improve click-through rate",
          "Optimize your H1 tag for better relevance",
        ],
        status: "warning",
      });

      toast({
        title: "Analysis Complete",
        description: "SEO analysis has been completed successfully",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold tracking-tight">Prism SEO</h1>
          <p className="text-lg text-muted-foreground">
            Analyze and optimize your website's SEO with precision
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="glass-card p-6">
            <form onSubmit={analyzeSEO} className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="url"
                    placeholder="Enter website URL"
                    className="pl-9"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                    />
                  ) : (
                    <ArrowRight className="mr-2 h-4 w-4" />
                  )}
                  {isAnalyzing ? "Analyzing..." : "Analyze"}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass-card p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Analysis Results</h2>
                  <p className="text-sm text-muted-foreground">{result.url}</p>
                </div>
                {result.status === "success" ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Title Tag</h3>
                  <p className="text-sm p-3 bg-secondary rounded-md">{result.title}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Meta Description</h3>
                  <p className="text-sm p-3 bg-secondary rounded-md">{result.description}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">H1 Tag</h3>
                  <p className="text-sm p-3 bg-secondary rounded-md">{result.h1}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Suggestions</h3>
                  <ul className="space-y-2">
                    {result.suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="text-sm p-3 bg-secondary rounded-md flex items-start gap-2"
                      >
                        <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Export Successful",
                      description: "Results have been exported to Google Sheets",
                    });
                  }}
                >
                  Export to Google Sheets
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Index;