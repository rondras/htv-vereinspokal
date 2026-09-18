import { Suspense } from "react";
import { ChallengeLeaderboard } from "@/components/challenge-leaderboard";
import { LeagueGrid } from "@/components/league-grid";
import { RefreshButton } from "@/components/refresh-button";
import { SeasonSelector } from "@/components/season-selector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_SEASON_YEAR } from "@/lib/nuliga/constants";
import { getSeasonData } from "@/lib/nuliga/sync";
import { formatDate, timeAgo } from "@/lib/utils";

interface HomePageProps {
  searchParams: Promise<{ season?: string }>;
}

async function Dashboard({ year }: { year: number }) {
  const season = await getSeasonData(year);
  const isStale = new Date(season.cacheExpiresAt).getTime() <= Date.now();

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-400">Hessischer Tennis-Verband</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
              HTV Vereinspokal {year}
            </h1>
            <p className="mt-2 max-w-2xl text-zinc-400">
              Tabellen, Spielpläne und die Vereins-Challenge — synchronisiert von nuLiga,
              zwischengespeichert für eine Stunde.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SeasonSelector currentYear={year} />
            <RefreshButton year={year} />
          </div>
        </div>

        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Datenstand</CardTitle>
            <CardDescription>
              Zuletzt aktualisiert {timeAgo(season.fetchedAt)} ({formatDate(season.fetchedAt)})
              {isStale ? " · Cache abgelaufen, wird bei nächstem Aufruf erneuert" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4 text-sm text-zinc-300">
            <span>{Object.keys(season.groups).length} Gruppen</span>
            <span>{season.challenge.length} Vereine in der Challenge</span>
            <span>{season.competitions.length} Spielklassen-Zeilen</span>
          </CardContent>
        </Card>
      </section>

      <ChallengeLeaderboard entries={season.challenge} limit={15} />
      <LeagueGrid competitions={season.competitions} year={year} />
    </div>
  );
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const year = Number.parseInt(params.season ?? String(DEFAULT_SEASON_YEAR), 10);

  return (
    <Suspense
      fallback={
        <Card>
          <CardHeader>
            <CardTitle>Lade HTV-Pokal Daten…</CardTitle>
            <CardDescription>nuLiga wird abgefragt oder aus dem Cache geladen.</CardDescription>
          </CardHeader>
        </Card>
      }
    >
      <Dashboard year={year} />
    </Suspense>
  );
}
