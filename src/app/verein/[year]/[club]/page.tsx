import { notFound } from "next/navigation";
import { ClubDetail } from "@/components/club-detail";
import { buildClubPageData, loadClubChallengeHistory } from "@/lib/nuliga/clubs";
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
  const [season, challengeHistory] = await Promise.all([
    getSeasonData(year),
    loadClubChallengeHistory(club),
  ]);
  const pageData = buildClubPageData(season, club, challengeHistory);

  if (!pageData) {
    notFound();
  }

  return <ClubDetail data={pageData} year={year} />;
}
