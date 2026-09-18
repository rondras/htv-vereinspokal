import { notFound } from "next/navigation";
import { ClubDetail } from "@/components/club-detail";
import { buildClubProfiles } from "@/lib/nuliga/clubs";
import { getSeasonData, isValidSeasonYear } from "@/lib/nuliga/sync";
import { slugToClub } from "@/lib/slug";

export const maxDuration = 60;

interface VereinPageProps {
  params: Promise<{ year: string; club: string }>;
}

export default async function VereinPage({ params }: VereinPageProps) {
  const { year: yearParam, club: clubSlug } = await params;
  const year = Number.parseInt(yearParam, 10);

  if (!isValidSeasonYear(year)) {
    notFound();
  }

  const club = slugToClub(clubSlug);
  const season = await getSeasonData(year);
  const profiles = buildClubProfiles(season);
  const profile = profiles.find((entry) => entry.club === club);

  if (!profile) {
    notFound();
  }

  const rank = profiles.findIndex((entry) => entry.club === club) + 1;

  return <ClubDetail profile={profile} year={year} rank={rank} />;
}
