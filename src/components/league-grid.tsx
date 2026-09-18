import Link from "next/link";
import type { CompetitionRow, GroupLink } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface LeagueGridProps {
  competitions: CompetitionRow[];
  year: number;
}

function GroupBadges({ groups, year }: { groups: GroupLink[]; year: number }) {
  if (groups.length === 0) {
    return <span className="text-xs text-zinc-600">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {groups.map((group) => (
        <Link key={group.id} href={`/liga/${year}/${group.id}`}>
          <Badge
            className={
              group.isKnockout
                ? "cursor-pointer border-amber-500/30 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20"
                : "cursor-pointer hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-200"
            }
          >
            {group.label}
          </Badge>
        </Link>
      ))}
    </div>
  );
}

export function LeagueGrid({ competitions, year }: LeagueGridProps) {
  if (competitions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ligen</CardTitle>
          <CardDescription>Für diese Saison sind noch keine Spielklassen veröffentlicht.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spielklassen {year}</CardTitle>
        <CardDescription>
          18 Konkurrenzen in Champions, Pros und Talents — Daten von nuLiga.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500">
              <th className="pb-3 pr-4 font-medium">Klasse</th>
              <th className="pb-3 pr-4 font-medium">Champions</th>
              <th className="pb-3 pr-4 font-medium">Pros</th>
              <th className="pb-3 font-medium">Talents</th>
            </tr>
          </thead>
          <tbody>
            {competitions.map((row) => (
              <tr key={row.category} className="border-b border-zinc-900/80 align-top last:border-0">
                <td className="py-4 pr-4 font-medium text-zinc-100">{row.category}</td>
                <td className="py-4 pr-4">
                  <GroupBadges groups={row.champions} year={year} />
                </td>
                <td className="py-4 pr-4">
                  <GroupBadges groups={row.pros} year={year} />
                </td>
                <td className="py-4">
                  <GroupBadges groups={row.talents} year={year} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
