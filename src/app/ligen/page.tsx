import { Suspense } from "react";
import { LeagueGrid } from "@/components/league-grid";
import { RefreshButton } from "@/components/refresh-button";
import { SeasonSelector } from "@/components/season-selector";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_SEASON_YEAR } from "@/lib/nuliga/constants";
import { getSeasonData } from "@/lib/nuliga/sync";

interface LigenPageProps {
  searchParams: Promise<{ season?: string }>;
}

async function LigenContent({ year }: { year: number }) {
  const season = await getSeasonData(year);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Alle Ligen</h1>
          <p className="mt-2 text-zinc-400">
            Spielklassen, Gruppen und K.O.-Phasen für {season.label}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SeasonSelector currentYear={year} basePath="/ligen" />
          <RefreshButton year={year} />
        </div>
      </div>
      <LeagueGrid competitions={season.competitions} year={year} />
    </div>
  );
}

export default async function LigenPage({ searchParams }: LigenPageProps) {
  const params = await searchParams;
  const year = Number.parseInt(params.season ?? String(DEFAULT_SEASON_YEAR), 10);

  return (
    <Suspense
      fallback={
        <Card>
          <CardHeader>
            <CardTitle>Lade Ligen…</CardTitle>
            <CardDescription>Bitte kurz warten.</CardDescription>
          </CardHeader>
        </Card>
      }
    >
      <LigenContent year={year} />
    </Suspense>
  );
}
