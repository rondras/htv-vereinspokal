import { LeagueGrid } from "@/components/league-grid";
import { SeasonPageFrame } from "@/components/season-page-frame";
import { DEFAULT_SEASON_YEAR } from "@/lib/nuliga/constants";
import { getSeasonData } from "@/lib/nuliga/sync";

export const maxDuration = 60;

interface LigenPageProps {
  searchParams: Promise<{ season?: string }>;
}

async function LigenContent({ year }: { year: number }) {
  const season = await getSeasonData(year);
  return <LeagueGrid competitions={season.competitions} year={year} />;
}

export default async function LigenPage({ searchParams }: LigenPageProps) {
  const params = await searchParams;
  const year = Number.parseInt(params.season ?? String(DEFAULT_SEASON_YEAR), 10);

  return (
    <SeasonPageFrame
      year={year}
      basePath="/ligen"
      renderHeader={(displayYear) => (
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Alle Ligen</h1>
          <p className="mt-2 text-zinc-400">
            Spielklassen, Gruppen und K.O.-Phasen für HTV-Pokal {displayYear}.
          </p>
        </div>
      )}
    >
      <LigenContent year={year} />
    </SeasonPageFrame>
  );
}
