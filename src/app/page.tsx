import { ChallengeLeaderboard } from "@/components/challenge-leaderboard";
import { ChallengeProjectionBanner } from "@/components/challenge-projection-banner";
import { HomeSeasonHeader } from "@/components/home-season-header";
import { LeagueGrid } from "@/components/league-grid";
import { SeasonPageFrame } from "@/components/season-page-frame";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_SEASON_YEAR } from "@/lib/nuliga/constants";
import { calculateSeasonProjection } from "@/lib/nuliga/projection";
import { getSeasonData } from "@/lib/nuliga/sync";
import { formatDate, timeAgo } from "@/lib/utils";

export const maxDuration = 60;

interface HomePageProps {
  searchParams: Promise<{ season?: string; refresh?: string }>;
}

async function DashboardContent({ year, forceRefresh }: { year: number; forceRefresh: boolean }) {
  const season = await getSeasonData(year, forceRefresh);
  const projection = calculateSeasonProjection(season);
  const isStale = new Date(season.cacheExpiresAt).getTime() <= Date.now();

  return (
    <>
      <ChallengeProjectionBanner projection={projection} year={year} />
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

      <ChallengeLeaderboard
        entries={season.challenge}
        projections={projection.clubs}
        year={year}
        seasonInProgress={projection.seasonInProgress}
        limit={15}
      />
      <LeagueGrid competitions={season.competitions} year={year} />
    </>
  );
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const year = Number.parseInt(params.season ?? String(DEFAULT_SEASON_YEAR), 10);
  const forceRefresh = params.refresh === "1";

  return (
    <SeasonPageFrame year={year} header={<HomeSeasonHeader year={year} />}>
      <DashboardContent year={year} forceRefresh={forceRefresh} />
    </SeasonPageFrame>
  );
}
