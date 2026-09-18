import Link from "next/link";
import type { ClubChallengeEntry } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ChallengeLeaderboardProps {
  entries: ClubChallengeEntry[];
  limit?: number;
}

export function ChallengeLeaderboard({ entries, limit = 10 }: ChallengeLeaderboardProps) {
  const visible = entries.slice(0, limit);

  if (visible.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vereins-Challenge</CardTitle>
          <CardDescription>Noch keine Daten für diese Saison verfügbar.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vereins-Challenge</CardTitle>
        <CardDescription>
          Welcher Verein sammelt die meisten Punkte über alle HTV-Pokal-Konkurrenzen?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="pb-3 pr-4 font-medium">#</th>
                <th className="pb-3 pr-4 font-medium">Verein</th>
                <th className="pb-3 pr-4 font-medium">Punkte</th>
                <th className="pb-3 pr-4 font-medium">Melded.</th>
                <th className="pb-3 pr-4 font-medium">Gr.</th>
                <th className="pb-3 pr-4 font-medium">K.O.</th>
                <th className="pb-3 pr-4 font-medium">3:0</th>
                <th className="pb-3 font-medium">w.o.</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((entry, index) => (
                <tr key={entry.club} className="border-b border-zinc-900/80 last:border-0">
                  <td className="py-3 pr-4 text-zinc-500">{index + 1}</td>
                  <td className="py-3 pr-4 font-medium text-zinc-100">{entry.club}</td>
                  <td className="py-3 pr-4">
                    <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                      {entry.totalPoints}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4 text-zinc-400">{entry.breakdown.registeredTeams}</td>
                  <td className="py-3 pr-4 text-zinc-400">{entry.breakdown.groupWins}</td>
                  <td className="py-3 pr-4 text-zinc-400">{entry.breakdown.knockoutWins}</td>
                  <td className="py-3 pr-4 text-zinc-400">{entry.breakdown.cleanSweepBonus}</td>
                  <td className="py-3 text-zinc-400">{entry.breakdown.walkoverMalus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {entries.length > limit ? (
          <p className="mt-4 text-xs text-zinc-500">
            Zeigt Top {limit} von {entries.length} Vereinen.{" "}
            <Link href="/ligen" className="text-emerald-400 hover:underline">
              Alle Ligen ansehen
            </Link>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
