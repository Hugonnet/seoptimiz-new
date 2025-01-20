import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useSEOStore } from "@/store/seoStore"

export interface PerformanceCardsProps {
  url: string;
}

export function PerformanceCards({ url }: PerformanceCardsProps) {
  const navigate = useNavigate()
  const seoData = useSEOStore((state) => state.seoData)
  const lastAnalysis = seoData[0]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="cursor-pointer" onClick={() => navigate("/export")}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Exports</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="link" className="px-0">
            Voir les exports
          </Button>
        </CardContent>
      </Card>
      <Card className="cursor-pointer" onClick={() => navigate("/history")}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Historique</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="link" className="px-0">
            Voir l'historique
          </Button>
        </CardContent>
      </Card>
      <Card className="cursor-pointer" onClick={() => navigate("/keyword-density")}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Densité mots clés</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="link" className="px-0">
            Voir l'analyse
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}