import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function URLForm() {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implémenter l'analyse SEO
    console.log("URL à analyser:", url);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 mb-8">
      <Input
        type="url"
        placeholder="Entrez l'URL à analyser"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1"
        required
      />
      <Button type="submit">
        Analyser
      </Button>
    </form>
  );
}