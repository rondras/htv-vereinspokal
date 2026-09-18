import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SeasonLoadingProps {
  year?: number;
  label?: string;
}

export function SeasonLoading({ year, label = "nuLiga wird abgefragt oder aus dem Cache geladen." }: SeasonLoadingProps) {
  return (
    <Card className="border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-400" aria-hidden="true" />
          {year ? `Lade Saison ${year}…` : "Lade HTV-Pokal Daten…"}
        </CardTitle>
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-900">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-emerald-500/40" />
        </div>
      </CardContent>
    </Card>
  );
}
