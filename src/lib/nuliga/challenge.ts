import type { ClubChallengeEntry, GroupData } from "@/lib/types";

function parseScore(score: string): [number, number] | null {
  const match = score.match(/(\d+)\s*:\s*(\d+)/);
  if (!match) return null;
  return [Number.parseInt(match[1]!, 10), Number.parseInt(match[2]!, 10)];
}

function winnerFromMatch(
  home: string,
  away: string,
  matchPoints: string,
  note?: string,
): { winner: string; loser: string; isCleanSweep: boolean; isWalkover: boolean } | null {
  if (!matchPoints || matchPoints === "-") return null;

  const [homeScore, awayScore] = parseScore(matchPoints) ?? [];
  if (homeScore === undefined || awayScore === undefined) return null;
  if (homeScore === awayScore) return null;

  const isWalkover = note === "Walkover" || /w\.o\./i.test(matchPoints);
  const winner = homeScore > awayScore ? home : away;
  const loser = homeScore > awayScore ? away : home;
  const isCleanSweep = Math.max(homeScore, awayScore) === 3 && Math.min(homeScore, awayScore) === 0;

  return { winner, loser, isCleanSweep, isWalkover };
}

export function calculateVereinsChallenge(groups: Record<string, GroupData>): ClubChallengeEntry[] {
  const clubMap = new Map<
    string,
    ClubChallengeEntry & { teamSet: Set<string> }
  >();

  function ensureClub(club: string): ClubChallengeEntry & { teamSet: Set<string> } {
    const existing = clubMap.get(club);
    if (existing) return existing;

    const created = {
      club,
      totalPoints: 0,
      breakdown: {
        registeredTeams: 0,
        groupWins: 0,
        knockoutWins: 0,
        cleanSweepBonus: 0,
        walkoverMalus: 0,
      },
      teams: [] as string[],
      teamSet: new Set<string>(),
    };
    clubMap.set(club, created);
    return created;
  }

  for (const group of Object.values(groups)) {
    for (const standing of group.standings) {
      const entry = ensureClub(standing.team);
      if (!entry.teamSet.has(standing.team)) {
        entry.teamSet.add(standing.team);
        entry.breakdown.registeredTeams += 1;
        entry.totalPoints += 1;
      }
    }

    for (const match of group.matches) {
      if (!match.isPlayed) continue;

      const result = winnerFromMatch(
        match.homeTeam,
        match.awayTeam,
        match.matchPoints,
        match.note,
      );
      if (!result) continue;

      const winnerEntry = ensureClub(result.winner);
      const loserEntry = ensureClub(result.loser);

      if (group.isKnockout) {
        winnerEntry.breakdown.knockoutWins += 1;
        winnerEntry.totalPoints += 4;
      } else {
        winnerEntry.breakdown.groupWins += 1;
        winnerEntry.totalPoints += 2;
      }

      if (result.isCleanSweep) {
        winnerEntry.breakdown.cleanSweepBonus += 1;
        winnerEntry.totalPoints += 1;
      }

      if (result.isWalkover) {
        loserEntry.breakdown.walkoverMalus += 1;
        loserEntry.totalPoints -= 1;
      }
    }
  }

  return Array.from(clubMap.values())
    .map(({ teamSet, ...entry }) => ({
      ...entry,
      teams: Array.from(teamSet).sort(),
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints || a.club.localeCompare(b.club, "de"));
}
