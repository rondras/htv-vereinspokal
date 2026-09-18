import { ExternalLink, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RULES } from "@/lib/nuliga/constants";

export default function RegelnPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Regeln & Vereins-Challenge</h1>
        <p className="mt-2 max-w-2xl text-zinc-400">
          Offizielle HTV-Pokal-Bestimmungen und wie die Vereins-Challenge gewertet wird.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-400" />
              Offizielle Dokumente
            </CardTitle>
            <CardDescription>Veröffentlicht vom Hessischen Tennis-Verband</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href={RULES.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3 text-sm text-zinc-200 transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/5"
            >
              Durchführungsbestimmungen 2026 (PDF)
              <ExternalLink className="h-4 w-4 text-zinc-500" />
            </a>
            <a
              href={RULES.infoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3 text-sm text-zinc-200 transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/5"
            >
              HTV-Pokal Infoseite
              <ExternalLink className="h-4 w-4 text-zinc-500" />
            </a>
            <a
              href={RULES.nuligaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3 text-sm text-zinc-200 transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/5"
            >
              nuLiga Ergebnisportal
              <ExternalLink className="h-4 w-4 text-zinc-500" />
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vereins-Challenge Punkte</CardTitle>
            <CardDescription>
              Der Verein mit den meisten Punkten gewinnt den Vereinspokal am Saisonende.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {RULES.challengePoints.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3 text-sm"
                >
                  <span className="text-zinc-300">{item.label}</span>
                  <Badge
                    className={
                      item.points < 0
                        ? "border-red-500/30 bg-red-500/10 text-red-300"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    }
                  >
                    {item.points > 0 ? "+" : ""}
                    {item.points}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spielmodus</CardTitle>
          <CardDescription>18 Konkurrenzen in drei Altersklassen und drei Spielstärken</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-zinc-300">
          <p>
            Der HTV-Pokal wird in Gruppenphase und K.O.-Runde ausgetragen. Pro Begegnung spielen
            vier gegen vier: zwei Einzel und ein Doppel, idealerweise zeitgleich auf drei Plätzen.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {RULES.competitions.map((block) => (
              <div key={block.age} className="rounded-lg border border-zinc-800 p-4">
                <p className="font-medium text-zinc-100">{block.age}</p>
                <ul className="mt-2 space-y-1 text-zinc-400">
                  {block.tiers.map((tier) => (
                    <li key={tier}>{tier}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-zinc-500">
            Diese App berechnet die Vereins-Challenge automatisch aus nuLiga-Ergebnissen. Die
            offizielle Wertung erfolgt durch den HTV.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
