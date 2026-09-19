import Link from "next/link";
import { ChallengeProjectionBar } from "@/components/challenge-projection-bar";
import { ClubLink } from "@/components/club-link";
import type { ClubChallengeEntry, ClubChallengeProjection } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ChallengeLeaderboardProps {
  entries: ClubChallengeEntry[];
  projections: ClubChallengeProjection[];
  year: number;
  seasonInProgress: boolean;
  limit?: number;
}

export function ChallengeLeaderboard({
  entries,
  projections,
  year,
  seasonInProgress,
  limit = 10,
}: ChallengeLeaderboardProps) {
  const projectionByClub = new Map(projections.map((entry) => [entry.club, entry]));
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
          {seasonInProgress
            ? "Aktueller Stand und bestmögliches Saisonergebnis pro Verein."
            : "Endstand der Vereins-Challenge über alle HTV-Pokal-Konkurrenzen."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="pb-3 pr-3 font-medium">#</th>
                <th className="pb-3 pr-3 font-medium">Verein</th>
                <th className="pb-3 pr-3 font-medium">Aktuell</th>
                {seasonInProgress ? (
                  <>
                    <th className="pb-3 pr-3 font-medium" title="Bestmöglicher Endstand">
                      Max
                    </th>
                    <th className="pb-3 pr-3 font-medium" title="Noch erreichbare Punkte">
                      Offen
                    </th>
                    <th className="pb-3 pr-3 font-medium" title="Rang bei bestmöglichem Ausgang">
                      Best
                    </th>
                    <th className="pb-3 pr-3 font-medium">Fortschritt</th>
                  </>
                ) : null}
                <th className="pb-3 pr-3 font-medium" title="+1 Punkt je gemeldeter Mannschaft">
                  Teams
                </th>
                <th className="pb-3 pr-3 font-medium" title="+2 Punkte je Sieg">
                  Gr.
                </th>
                <th className="pb-3 pr-3 font-medium" title="+4 Punkte je Sieg">
                  K.O.
                </th>
                <th className="pb-3 pr-3 font-medium" title="+1 Bonus">
                  3:0
                </th>
                <th className="pb-3 font-medium" title="−1 Malus">
                  w.o.
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((entry, index) => {
                const projection = projectionByClub.get(entry.club);
                const rankDelta =
                  projection && projection.bestCaseRank !== projection.currentRank
                    ? projection.currentRank - projection.bestCaseRank
                    : 0;

                return (
                  <tr key={entry.club} className="border-b border-zinc-900/80 last:border-0">
                    <td className="py-3 pr-3 text-zinc-500">{index + 1}</td>
                    <td className="py-3 pr-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <ClubLink club={entry.club} year={year} />
                        {projection?.canStillWinChallenge ? (
                          <Badge className="border-sky-500/30 bg-sky-500/10 text-sky-200 text-[10px]">
                            im Rennen
                          </Badge>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-3 pr-3">
                      <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                        {entry.totalPoints}
                      </Badge>
                    </td>
                    {seasonInProgress && projection ? (
                      <>
                        <td className="py-3 pr-3 tabular-nums text-zinc-300">
                          {projection.maxPossiblePoints}
                        </td>
                        <td className="py-3 pr-3 tabular-nums">
                          {projection.remainingPoints > 0 ? (
                            <span className="text-sky-300">+{projection.remainingPoints}</span>
                          ) : (
                            <span className="text-zinc-600">0</span>
                          )}
                        </td>
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-1.5 tabular-nums">
                            <span className="text-zinc-300">{projection.bestCaseRank}</span>
                            {rankDelta > 0 ? (
                              <span className="text-xs text-emerald-400">↑{rankDelta}</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-3 pr-3">
                          <ChallengeProjectionBar
                            current={projection.currentPoints}
                            max={projection.maxPossiblePoints}
                          />
                        </td>
                      </>
                    ) : null}
                    <td className="py-3 pr-3 text-zinc-400">{entry.breakdown.registeredTeams}</td>
                    <td className="py-3 pr-3 text-zinc-400">{entry.breakdown.groupWins}</td>
                    <td className="py-3 pr-3 text-zinc-400">{entry.breakdown.knockoutWins}</td>
                    <td className="py-3 pr-3 text-zinc-400">{entry.breakdown.cleanSweepBonus}</td>
                    <td className="py-3 pr-3 text-zinc-400">{entry.breakdown.walkoverMalus}</td>
                  </tr>
                );
              })}
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
