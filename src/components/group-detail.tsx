import Link from "next/link";
import { ClubLink } from "@/components/club-link";
import type { GroupData } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface GroupDetailProps {
  group: GroupData;
  year: number;
}

export function GroupDetail({ group, year }: GroupDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Badge className={group.isKnockout ? "border-amber-500/30 bg-amber-500/10 text-amber-200" : ""}>
          {group.isKnockout ? "K.O.-Phase" : "Gruppenphase"}
        </Badge>
        <Link href="/ligen" className="text-sm text-zinc-500 hover:text-zinc-300">
          ← Alle Ligen
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{group.title}</CardTitle>
          <CardDescription>HTV-Pokal {year} · nuLiga Gruppe {group.id}</CardDescription>
        </CardHeader>
        {group.standings.length > 0 ? (
          <CardContent className="overflow-x-auto">
            <h3 className="mb-3 text-sm font-medium text-zinc-300">Tabelle</h3>
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="pb-3 pr-3 font-medium">Rang</th>
                  <th className="pb-3 pr-3 font-medium">Mannschaft</th>
                  <th className="pb-3 pr-3 font-medium">Sp.</th>
                  <th className="pb-3 pr-3 font-medium">S</th>
                  <th className="pb-3 pr-3 font-medium">U</th>
                  <th className="pb-3 pr-3 font-medium">N</th>
                  <th className="pb-3 pr-3 font-medium">Pkt.</th>
                  <th className="pb-3 pr-3 font-medium">Match</th>
                  <th className="pb-3 font-medium">Sätze</th>
                </tr>
              </thead>
              <tbody>
                {group.standings.map((row) => (
                  <tr key={row.team} className="border-b border-zinc-900/80 last:border-0">
                    <td className="py-3 pr-3 text-zinc-500">{row.rank}</td>
                    <td className="py-3 pr-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <ClubLink club={row.team} year={year} />
                        {row.withdrawnAt ? (
                          <Badge className="border-zinc-600 bg-zinc-900 text-zinc-400">
                            Zurückgezogen
                            {row.withdrawnAt !== "unbekannt" ? ` · ${row.withdrawnAt}` : ""}
                          </Badge>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-zinc-400">{row.played}</td>
                    <td className="py-3 pr-3 text-zinc-400">{row.wins}</td>
                    <td className="py-3 pr-3 text-zinc-400">{row.draws}</td>
                    <td className="py-3 pr-3 text-zinc-400">{row.losses}</td>
                    <td className="py-3 pr-3 text-zinc-400">{row.points}</td>
                    <td className="py-3 pr-3 text-zinc-400">{row.matchPoints}</td>
                    <td className="py-3 text-zinc-400">{row.sets}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        ) : null}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spielplan</CardTitle>
          <CardDescription>{group.matches.length} Begegnungen</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {group.matches.length === 0 ? (
            <p className="text-sm text-zinc-500">Noch keine Spiele veröffentlicht.</p>
          ) : (
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="pb-3 pr-3 font-medium">Datum</th>
                  <th className="pb-3 pr-3 font-medium">Heim</th>
                  <th className="pb-3 pr-3 font-medium">Gast</th>
                  <th className="pb-3 pr-3 font-medium">Ergebnis</th>
                  <th className="pb-3 font-medium">Bericht</th>
                </tr>
              </thead>
              <tbody>
                {group.matches.map((match, index) => (
                  <tr key={`${match.date}-${match.homeTeam}-${index}`} className="border-b border-zinc-900/80 last:border-0">
                    <td className="py-3 pr-3 whitespace-nowrap text-zinc-400">
                      {match.day} {match.date}
                    </td>
                    <td className="py-3 pr-3">
                      <ClubLink club={match.homeTeam} year={year} />
                    </td>
                    <td className="py-3 pr-3">
                      <ClubLink club={match.awayTeam} year={year} />
                    </td>
                    <td className="py-3 pr-3">
                      {match.note === "Zurückgezogen" ? (
                        <span className="text-zinc-400">Zurückgezogen</span>
                      ) : match.isPlayed ? (
                        <span className="font-medium text-emerald-300">{match.matchPoints}</span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                      {match.note && match.note !== "Zurückgezogen" ? (
                        <span className="ml-2 text-xs text-amber-400">{match.note}</span>
                      ) : null}
                    </td>
                    <td className="py-3">
                      {match.reportUrl ? (
                        <a
                          href={match.reportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:underline"
                        >
                          nuLiga
                        </a>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
