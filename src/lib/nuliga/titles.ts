import type { GroupData, SeasonData } from "@/lib/types";

export interface ClubTitle {
  year: number;
  label: string;
  category: string;
  tier: "Champions" | "Pros" | "Talents";
  groupId: string;
  groupTitle: string;
}

function parseScore(score: string): [number, number] | null {
  const match = score.match(/(\d+)\s*:\s*(\d+)/);
  if (!match) return null;
  return [Number.parseInt(match[1]!, 10), Number.parseInt(match[2]!, 10)];
}

export function findKnockoutChampion(group: GroupData): string | null {
  const losses = new Set<string>();
  const wins = new Set<string>();

  for (const match of group.matches) {
    if (!match.isPlayed) continue;

    const [homeScore, awayScore] = parseScore(match.matchPoints) ?? [];
    if (homeScore === undefined || awayScore === undefined || homeScore === awayScore) continue;

    const winner = homeScore > awayScore ? match.homeTeam : match.awayTeam;
    const loser = homeScore > awayScore ? match.awayTeam : match.homeTeam;
    losses.add(loser);
    wins.add(winner);
  }

  const undefeated = [...wins].filter((team) => !losses.has(team));
  return undefeated.length === 1 ? undefeated[0]! : null;
}

function tierFromLkStart(lkStart: number): ClubTitle["tier"] {
  if (lkStart <= 1.5) return "Champions";
  if (lkStart <= 10.5) return "Pros";
  return "Talents";
}

export function parseKnockoutTitleLabel(groupTitle: string): Pick<ClubTitle, "label" | "category" | "tier"> {
  const withoutPrefix = groupTitle
    .replace(/^HTV-Pokal \d+\s*/i, "")
    .replace(/\s*-?\s*K\.O\.-Phase\s*$/i, "")
    .replace(/^K\.O\.-Phase:\s*/i, "")
    .trim();

  const lkMatch = withoutPrefix.match(/Generali LK ([\d,]+)-([\d,]+)/i);
  const lkStart = lkMatch ? Number.parseFloat(lkMatch[1]!.replace(",", ".")) : 10;
  const tier = tierFromLkStart(lkStart);

  const category = withoutPrefix
    .replace(/\s*-?\s*Generali LK .*/i, "")
    .replace(/\s*-\s*$/, "")
    .trim();

  return {
    category,
    tier,
    label: `${category} · ${tier}`,
  };
}

export function getClubTitlesInSeason(season: SeasonData, club: string): ClubTitle[] {
  const titles: ClubTitle[] = [];

  for (const group of Object.values(season.groups)) {
    if (!group.isKnockout) continue;

    const champion = findKnockoutChampion(group);
    if (champion !== club) continue;

    const parsed = parseKnockoutTitleLabel(group.title);
    titles.push({
      year: season.year,
      groupId: group.id,
      groupTitle: group.title,
      ...parsed,
    });
  }

  return titles.sort((a, b) => a.label.localeCompare(b.label, "de"));
}
