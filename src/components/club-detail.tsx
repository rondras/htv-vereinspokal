import Link from "next/link";
import type { ClubProfile } from "@/lib/nuliga/clubs";
import { clubToSlug } from "@/lib/slug";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ClubDetailProps {
  profile: ClubProfile;
  year: number;
  rank?: number;
}

export function ClubDetail({ profile, year, rank }: ClubDetailProps) {
  const clubSlug = clubToSlug(profile.club);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        {rank !== undefined ? (
          <Badge className="border-zinc-700 bg-zinc-900 text-zinc-300">Rang {rank}</Badge>
        ) : null}
        <Link href={`/?season=${year}`} className="text-sm text-zinc-500 hover:text-zinc-300">
          ← Vereins-Challenge
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{profile.club}</CardTitle>
          <CardDescription>
            HTV-Pokal {year} · {profile.teams.length}{" "}
            {profile.teams.length === 1 ? "Mannschaft" : "Mannschaften"} gemeldet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <p className="text-zinc-500">Challenge-Punkte</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-300">{profile.challenge.totalPoints}</p>
            </div>
            <div>
              <p className="text-zinc-500">Gruppensiege</p>
              <p className="mt-1 text-lg font-medium text-zinc-200">{profile.challenge.breakdown.groupWins}</p>
            </div>
            <div>
              <p className="text-zinc-500">K.O.-Siege</p>
              <p className="mt-1 text-lg font-medium text-zinc-200">{profile.challenge.breakdown.knockoutWins}</p>
            </div>
            <div>
              <p className="text-zinc-500">3:0-Bonus</p>
              <p className="mt-1 text-lg font-medium text-zinc-200">{profile.challenge.breakdown.cleanSweepBonus}</p>
            </div>
            <div>
              <p className="text-zinc-500">Walkover</p>
              <p className="mt-1 text-lg font-medium text-zinc-200">{profile.challenge.breakdown.walkoverMalus}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mannschaften</CardTitle>
          <CardDescription>
            Klicke auf eine Mannschaft, um Gruppen- und K.O.-Spiele im Detail zu sehen.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {profile.teams.length === 0 ? (
            <p className="text-sm text-zinc-500">Keine Mannschaften in der Gruppenphase gefunden.</p>
          ) : (
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="pb-3 pr-3 font-medium">Spielklasse</th>
                  <th className="pb-3 pr-3 font-medium">Rang</th>
                  <th className="pb-3 pr-3 font-medium">Sp.</th>
                  <th className="pb-3 pr-3 font-medium">Pkt.</th>
                  <th className="pb-3 pr-3 font-medium" title="+2 Punkte je Sieg">
                    Gr.
                  </th>
                  <th className="pb-3 pr-3 font-medium" title="+4 Punkte je Sieg">
                    K.O.
                  </th>
                  <th className="pb-3 pr-3 font-medium">Challenge</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {profile.teams.map((team) => (
                  <tr key={`${team.groupId}-${team.teamId}`} className="border-b border-zinc-900/80 last:border-0">
                    <td className="py-3 pr-3 font-medium text-zinc-100">{team.groupTitle}</td>
                    <td className="py-3 pr-3 text-zinc-400">{team.standing?.rank ?? "—"}</td>
                    <td className="py-3 pr-3 text-zinc-400">{team.standing?.played ?? team.playedMatches}</td>
                    <td className="py-3 pr-3 text-zinc-400">{team.standing?.points ?? "—"}</td>
                    <td className="py-3 pr-3 text-zinc-400">{team.groupWins}</td>
                    <td className="py-3 pr-3 text-zinc-400">{team.knockoutWins}</td>
                    <td className="py-3 pr-3">
                      <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                        {team.challengePoints}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Link
                        href={`/verein/${year}/${clubSlug}/team/${team.groupId}/${encodeURIComponent(team.teamId)}`}
                        className="text-emerald-400 hover:underline"
                      >
                        Pfad ansehen →
                      </Link>
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
