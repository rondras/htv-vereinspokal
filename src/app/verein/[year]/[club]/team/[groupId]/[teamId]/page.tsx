import { notFound } from "next/navigation";
import { TeamPathView } from "@/components/team-path";
import { buildTeamPath } from "@/lib/nuliga/clubs";
import { getSeasonData, isValidSeasonYear } from "@/lib/nuliga/sync";
import { slugToClub } from "@/lib/slug";

export const maxDuration = 60;

interface TeamPathPageProps {
  params: Promise<{ year: string; club: string; groupId: string; teamId: string }>;
}

export default async function TeamPathPage({ params }: TeamPathPageProps) {
  const { year: yearParam, club: clubSlug, groupId, teamId: teamIdParam } = await params;
  const year = Number.parseInt(yearParam, 10);
  const teamId = decodeURIComponent(teamIdParam);

  if (!isValidSeasonYear(year)) {
    notFound();
  }

  const club = slugToClub(clubSlug);
  const season = await getSeasonData(year);
  const path = buildTeamPath(season, groupId, teamId);

  if (!path || path.club !== club) {
    notFound();
  }

  return <TeamPathView path={path} year={year} />;
}
