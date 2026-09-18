import { notFound } from "next/navigation";
import { GroupDetail } from "@/components/group-detail";
import { getSeasonData, isValidSeasonYear } from "@/lib/nuliga/sync";

export const maxDuration = 60;

interface LigaDetailPageProps {
  params: Promise<{ year: string; groupId: string }>;
}

export default async function LigaDetailPage({ params }: LigaDetailPageProps) {
  const { year: yearParam, groupId } = await params;
  const year = Number.parseInt(yearParam, 10);

  if (!isValidSeasonYear(year)) {
    notFound();
  }

  const season = await getSeasonData(year);
  const group = season.groups[groupId];

  if (!group) {
    notFound();
  }

  return <GroupDetail group={group} year={year} />;
}
