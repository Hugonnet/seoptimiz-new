import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, History, KeyRound, Gauge } from "lucide-react";

export function ActionCards() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Mots clés",
      description: "Analysez la fréquence et la densité des mots clés de votre contenu",
      icon: KeyRound,
      action: () => navigate("/keyword-density"),
      buttonText: "Voir l'analyse"
    },
    {
      title: "Exports",
      description: "Exportez et gérez vos analyses SEO par entreprise",
      icon: FileText,
      action: () => navigate("/export"),
      buttonText: "Voir les exports"
    },
    {
      title: "Historique",
      description: "Consultez et exportez l'historique de vos analyses SEO",
      icon: History,
      action: () => navigate("/history"),
      buttonText: "Voir l'historique"
    },
    {
      title: "Vitesse de chargement",
      description: "Analysez les performances de chargement de votre site",
      icon: Gauge,
      action: () => navigate("/performance"),
      buttonText: "Voir les performances"
    }
  ];

  return (
    <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
      {cards.map((card, index) => (
        <Card key={index} className="bg-white/90">
          <CardHeader className="space-y-1 p-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#EC4899] rounded-lg flex items-center justify-center mb-2">
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-lg">{card.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-sm text-gray-600 mb-4">{card.description}</p>
            <Button 
              onClick={card.action}
              className="w-full bg-gradient-to-r from-[#6366F1] to-[#EC4899] hover:from-[#4F46E5] hover:to-[#DB2777] text-white"
            >
              {card.buttonText}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}