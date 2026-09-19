import Link from "next/link";
import { ChallengeProjectionBar } from "@/components/challenge-projection-bar";
import type { ClubPageData } from "@/lib/nuliga/clubs";
import { clubToSlug } from "@/lib/slug";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ClubDetailProps {
  data: ClubPageData;
  year: number;
}

function tierBadgeClass(tier: string): string {
  switch (tier) {
    case "Champions":
      return "border-amber-500/40 bg-amber-500/10 text-amber-200";
    case "Pros":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "Talents":
      return "border-sky-500/30 bg-sky-500/10 text-sky-300";
    default:
      return "border-zinc-700 bg-zinc-900 text-zinc-300";
  }
}

export function ClubDetail({ data, year }: ClubDetailProps) {
  const { profile, rank, titles, challengeHistory, projection } = data;
  const clubSlug = clubToSlug(profile.club);
  const historyWithParticipation = challengeHistory.filter((entry) => entry.participated);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        {rank > 0 ? (
          <Badge className="border-zinc-700 bg-zinc-900 text-zinc-300">Rang {rank}</Badge>
        ) : null}
        {titles.length > 0 ? (
          <Badge className="border-amber-500/40 bg-amber-500/10 text-amber-200">
            {titles.length} {titles.length === 1 ? "Titel" : "Titel"} {year}
          </Badge>
        ) : null}
        {projection?.canStillWinChallenge ? (
          <Badge className="border-sky-500/30 bg-sky-500/10 text-sky-200">Noch im Rennen</Badge>
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
          {projection && projection.remainingPoints > 0 ? (
            <div className="mt-6 rounded-lg border border-sky-500/20 bg-sky-500/5 px-4 py-4">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-sky-200">Verbleibendes Potenzial</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {projection.remainingGroupMatches} Gruppenspiele · {projection.remainingKnockoutMatches}{" "}
                    K.O.-Spiele offen
                  </p>
                </div>
                <div className="flex flex-wrap items-end gap-6 text-sm">
                  <div>
                    <p className="text-zinc-500">Max. möglich</p>
                    <p className="mt-1 text-xl font-semibold text-sky-300">{projection.maxPossiblePoints}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Noch offen</p>
                    <p className="mt-1 text-xl font-semibold text-sky-300">+{projection.remainingPoints}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Best-Case-Rang</p>
                    <p className="mt-1 text-xl font-semibold text-zinc-200">#{projection.bestCaseRank}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 max-w-xs">
                <ChallengeProjectionBar
                  current={projection.currentPoints}
                  max={projection.maxPossiblePoints}
                />
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className={titles.length > 0 ? "border-amber-500/20 bg-amber-500/5" : undefined}>
        <CardHeader>
          <CardTitle>Titel {year}</CardTitle>
          <CardDescription>
            HTV-Pokal-Siege in der K.O.-Phase — ein Titel pro gewonnener Spielklasse.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {titles.length === 0 ? (
            <p className="text-sm text-zinc-500">In dieser Saison noch kein Pokaltitel gewonnen.</p>
          ) : (
            <ul className="space-y-3">
              {titles.map((title) => (
                <li
                  key={title.groupId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/20 bg-zinc-950/40 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-zinc-100">{title.label}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">{title.groupTitle}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={tierBadgeClass(title.tier)}>{title.tier}</Badge>
                    <Link
                      href={`/liga/${year}/${title.groupId}`}
                      className="text-sm text-emerald-400 hover:underline"
                    >
                      K.O.-Phase →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vereins-Challenge · Historie</CardTitle>
          <CardDescription>
            Platzierung und Punkte über alle verfügbaren Saisons ({historyWithParticipation.length} Teilnahmen).
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="pb-3 pr-4 font-medium">Saison</th>
                <th className="pb-3 pr-4 font-medium">Rang</th>
                <th className="pb-3 pr-4 font-medium">Punkte</th>
                <th className="pb-3 font-medium">Teams</th>
              </tr>
            </thead>
            <tbody>
              {challengeHistory.map((entry) => (
                <tr
                  key={entry.year}
                  className={`border-b border-zinc-900/80 last:border-0 ${
                    entry.year === year ? "bg-emerald-500/5" : ""
                  }`}
                >
                  <td className="py-3 pr-4">
                    {entry.participated ? (
                      <Link
                        href={`/verein/${entry.year}/${clubSlug}`}
                        className={`font-medium transition-colors duration-150 ease-out hover:text-emerald-400 ${
                          entry.year === year ? "text-emerald-300" : "text-zinc-200"
                        }`}
                      >
                        HTV-Pokal {entry.year}
                        {entry.year === year ? " · aktuell" : ""}
                      </Link>
                    ) : (
                      <span className="text-zinc-600">HTV-Pokal {entry.year}</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-zinc-400">
                    {entry.participated ? (
                      <Badge
                        className={
                          entry.rank <= 3
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : "border-zinc-700 bg-zinc-900 text-zinc-400"
                        }
                      >
                        #{entry.rank}
                      </Badge>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-zinc-300">
                    {entry.participated ? entry.totalPoints : "—"}
                  </td>
                  <td className="py-3 text-zinc-400">
                    {entry.participated ? entry.registeredTeams : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
