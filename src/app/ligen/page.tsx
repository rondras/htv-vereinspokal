import { LeagueGrid } from "@/components/league-grid";
import { LigenSeasonHeader } from "@/components/ligen-season-header";
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
    <SeasonPageFrame year={year} basePath="/ligen" header={<LigenSeasonHeader year={year} />}>
      <LigenContent year={year} />
    </SeasonPageFrame>
  );
}
