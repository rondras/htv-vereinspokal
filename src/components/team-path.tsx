import Link from "next/link";
import type { TeamPath } from "@/lib/nuliga/clubs";
import { clubToSlug } from "@/lib/slug";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TeamPathViewProps {
  path: TeamPath;
  year: number;
}

function resultBadge(result: TeamPath["groupMatches"][number]["result"]) {
  switch (result) {
    case "Sieg":
      return (
        <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">Sieg</Badge>
      );
    case "Niederlage":
      return (
        <Badge className="border-red-500/30 bg-red-500/10 text-red-300">Niederlage</Badge>
      );
    case "Unentschieden":
      return (
        <Badge className="border-zinc-600 bg-zinc-900 text-zinc-300">Remis</Badge>
      );
    case "Offen":
      return (
        <Badge className="border-zinc-700 bg-zinc-900 text-zinc-500">Offen</Badge>
      );
    default: {
      const _exhaustive: never = result;
      return _exhaustive;
    }
  }
}

function MatchTable({ matches, emptyMessage }: { matches: TeamPath["groupMatches"]; emptyMessage: string }) {
  if (matches.length === 0) {
    return <p className="text-sm text-zinc-500">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-zinc-500">
            <th className="pb-3 pr-3 font-medium">Datum</th>
            <th className="pb-3 pr-3 font-medium">Gegner</th>
            <th className="pb-3 pr-3 font-medium">H/A</th>
            <th className="pb-3 pr-3 font-medium">Ergebnis</th>
            <th className="pb-3 pr-3 font-medium">Status</th>
            <th className="pb-3 font-medium">Bericht</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match, index) => (
            <tr
              key={`${match.groupId}-${match.date}-${match.opponent}-${index}`}
              className="border-b border-zinc-900/80 last:border-0"
            >
              <td className="py-3 pr-3 whitespace-nowrap text-zinc-400">
                {match.day} {match.date}
              </td>
              <td className="py-3 pr-3 font-medium text-zinc-100">{match.opponent}</td>
              <td className="py-3 pr-3 text-zinc-400">{match.isHome ? "Heim" : "Auswärts"}</td>
              <td className="py-3 pr-3">
                {match.isPlayed ? (
                  <span className="font-medium text-emerald-300">{match.matchPoints}</span>
                ) : (
                  <span className="text-zinc-600">—</span>
                )}
                {match.note ? (
                  <span className="ml-2 text-xs text-amber-400">{match.note}</span>
                ) : null}
              </td>
              <td className="py-3 pr-3">{resultBadge(match.result)}</td>
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
    </div>
  );
}

export function TeamPathView({ path, year }: TeamPathViewProps) {
  const clubSlug = clubToSlug(path.club);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Badge>{path.groupTitle}</Badge>
        <Link
          href={`/verein/${year}/${clubSlug}`}
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          ← {path.club}
        </Link>
        <Link href={`/liga/${year}/${path.groupId}`} className="text-sm text-zinc-500 hover:text-zinc-300">
          Gruppe ansehen
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{path.club}</CardTitle>
          <CardDescription>
            HTV-Pokal {year} · {path.groupTitle}
            {path.standing ? ` · Tabellenplatz ${path.standing.rank}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <p className="text-zinc-500">Challenge-Punkte</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-300">{path.stats.challengePoints}</p>
            </div>
            <div>
              <p className="text-zinc-500">Gruppensiege</p>
              <p className="mt-1 text-lg font-medium text-zinc-200">{path.stats.groupWins}</p>
            </div>
            <div>
              <p className="text-zinc-500">K.O.-Siege</p>
              <p className="mt-1 text-lg font-medium text-zinc-200">{path.stats.knockoutWins}</p>
            </div>
            <div>
              <p className="text-zinc-500">3:0-Bonus</p>
              <p className="mt-1 text-lg font-medium text-zinc-200">{path.stats.cleanSweepBonus}</p>
            </div>
            <div>
              <p className="text-zinc-500">Walkover</p>
              <p className="mt-1 text-lg font-medium text-zinc-200">{path.stats.walkoverMalus}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gruppenphase</CardTitle>
          <CardDescription>{path.groupMatches.length} Begegnungen</CardDescription>
        </CardHeader>
        <CardContent>
          <MatchTable matches={path.groupMatches} emptyMessage="Noch keine Gruppenspiele für diese Mannschaft." />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>K.O.-Phase</CardTitle>
          <CardDescription>{path.knockoutMatches.length} Begegnungen</CardDescription>
        </CardHeader>
        <CardContent>
          <MatchTable
            matches={path.knockoutMatches}
            emptyMessage="Noch nicht in der K.O.-Phase oder ausgeschieden vor K.O.-Start."
          />
        </CardContent>
      </Card>
    </div>
  );
}
