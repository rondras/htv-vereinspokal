import type { GroupData, MatchRow, SeasonData } from "@/lib/types";

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

function isByeTeam(name: string): boolean {
  return /^spielfrei$/i.test(name);
}

function isRealTeam(name: string): boolean {
  return Boolean(name) && !isByeTeam(name);
}

function recordWin(wins: Set<string>, losses: Set<string>, winner: string, loser: string): void {
  if (!isRealTeam(winner) || !isRealTeam(loser)) return;
  wins.add(winner);
  losses.add(loser);
}

function recordBye(wins: Set<string>, team: string): void {
  if (isRealTeam(team)) {
    wins.add(team);
  }
}

function hasUnplayedRealMatches(matches: MatchRow[]): boolean {
  return matches.some(
    (match) =>
      !match.isPlayed &&
      isRealTeam(match.homeTeam) &&
      isRealTeam(match.awayTeam) &&
      !isByeTeam(match.homeTeam) &&
      !isByeTeam(match.awayTeam),
  );
}

function findUndefeatedChampion(matches: MatchRow[]): string | null {
  const losses = new Set<string>();
  const wins = new Set<string>();

  for (const match of matches) {
    if (!match.isPlayed) continue;

    if (isByeTeam(match.homeTeam) || isByeTeam(match.awayTeam)) {
      if (isByeTeam(match.awayTeam)) recordBye(wins, match.homeTeam);
      if (isByeTeam(match.homeTeam)) recordBye(wins, match.awayTeam);
      continue;
    }

    const [homeScore, awayScore] = parseScore(match.matchPoints) ?? [];
    if (homeScore === undefined || awayScore === undefined || homeScore === awayScore) continue;

    const winner = homeScore > awayScore ? match.homeTeam : match.awayTeam;
    const loser = homeScore > awayScore ? match.awayTeam : match.homeTeam;
    recordWin(wins, losses, winner, loser);
  }

  const undefeated = [...wins].filter((team) => !losses.has(team));
  return undefeated.length === 1 ? undefeated[0]! : null;
}

function findFinalRoundWinner(matches: MatchRow[]): string | null {
  let lastWinner: string | null = null;

  for (const match of matches) {
    if (!match.isPlayed) continue;

    if (isByeTeam(match.homeTeam) || isByeTeam(match.awayTeam)) {
      if (isByeTeam(match.awayTeam) && isRealTeam(match.homeTeam)) {
        lastWinner = match.homeTeam;
      } else if (isByeTeam(match.homeTeam) && isRealTeam(match.awayTeam)) {
        lastWinner = match.awayTeam;
      }
      continue;
    }

    const [homeScore, awayScore] = parseScore(match.matchPoints) ?? [];
    if (homeScore === undefined || awayScore === undefined || homeScore === awayScore) continue;

    lastWinner = homeScore > awayScore ? match.homeTeam : match.awayTeam;
  }

  return lastWinner;
}

/** K.O.-style bracket — includes 2023 "Hauptfeld" / "Nebenrunde" naming. */
export function isKnockoutTitleGroup(group: GroupData): boolean {
  return (
    group.isKnockout ||
    /k\.o\.-phase|nebenrunde|hauptfeld/i.test(group.title)
  );
}

export function findKnockoutChampion(group: GroupData): string | null {
  const undefeated = findUndefeatedChampion(group.matches);
  if (undefeated) return undefeated;

  if (hasUnplayedRealMatches(group.matches)) {
    return null;
  }

  return findFinalRoundWinner(group.matches);
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
    .replace(/\s*-?\s*HTV-Pokal Nebenrunde\s*$/i, "")
    .replace(/\s*-?\s*HTV-Pokal Hauptfeld\s*$/i, "")
    .trim();

  const lkMatch = withoutPrefix.match(/(?:Generali )?LK ([\d,]+)-([\d,]+)/i);
  const lkStart = lkMatch ? Number.parseFloat(lkMatch[1]!.replace(",", ".")) : 10;
  const tier = tierFromLkStart(lkStart);

  const category = withoutPrefix
    .replace(/\s*-?\s*(?:Generali )?LK .*/i, "")
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
    if (!isKnockoutTitleGroup(group)) continue;

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
