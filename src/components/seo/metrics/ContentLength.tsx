import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ContentLengthProps {
  length: number;
}

export function ContentLength({ length }: ContentLengthProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Longueur du contenu</CardTitle>
        <CardDescription>Nombre de mots</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{(length || 0).toLocaleString()}</p>
      </CardContent>
    </Card>
  );
}