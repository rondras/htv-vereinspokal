import type {
  ClubChallengeEntry,
  ClubChallengeProjection,
  GroupData,
  MatchRow,
  SeasonData,
  SeasonProjection,
} from "@/lib/types";
import { calculateVereinsChallenge } from "@/lib/nuliga/challenge";
import {
  buildKnockoutStartedKeys,
  buildWithdrawnTeamKeysByGroup,
  isWithdrawnMatch,
  matchInvolvesWithdrawnTeam,
  normalizeCompetitionKey,
} from "@/lib/nuliga/competition";

export type { ClubChallengeProjection, SeasonProjection };

export const CHALLENGE_POINT_VALUES = {
  registration: 1,
  groupWin: 2,
  knockoutWin: 4,
  cleanSweep: 1,
  walkoverMalus: -1,
  maxPerGroupMatch: 3,
  maxPerKnockoutMatch: 5,
} as const;

interface ClubRemainingUpside {
  remainingPoints: number;
  remainingGroupMatches: number;
  remainingKnockoutMatches: number;
}

function isRealMatch(match: MatchRow): boolean {
  return (
    Boolean(match.homeTeam && match.awayTeam) &&
    !/^spielfrei$/i.test(match.homeTeam) &&
    !/^spielfrei$/i.test(match.awayTeam)
  );
}

function isSameTeamMatch(match: MatchRow): boolean {
  return match.homeTeam.trim().toLowerCase() === match.awayTeam.trim().toLowerCase();
}

function isActionableUnplayedMatch(
  match: MatchRow,
  group: GroupData,
  knockoutStartedKeys: Set<string>,
  withdrawnByGroup: Map<string, Set<string>>,
): boolean {
  if (match.isPlayed || !isRealMatch(match) || isSameTeamMatch(match)) {
    return false;
  }

  if (isWithdrawnMatch(match) || matchInvolvesWithdrawnTeam(match, group, withdrawnByGroup)) {
    return false;
  }

  if (!group.isKnockout && knockoutStartedKeys.has(normalizeCompetitionKey(group.title))) {
    return false;
  }

  return true;
}

function maxPointsForUnplayedMatch(group: GroupData): number {
  return group.isKnockout
    ? CHALLENGE_POINT_VALUES.maxPerKnockoutMatch
    : CHALLENGE_POINT_VALUES.maxPerGroupMatch;
}

function collectRemainingUpside(
  groups: Record<string, GroupData>,
  knockoutStartedKeys: Set<string>,
  withdrawnByGroup: Map<string, Set<string>>,
): Map<string, ClubRemainingUpside> {
  const remainingByClub = new Map<string, ClubRemainingUpside>();

  function ensureClub(club: string): ClubRemainingUpside {
    const existing = remainingByClub.get(club);
    if (existing) return existing;

    const created: ClubRemainingUpside = {
      remainingPoints: 0,
      remainingGroupMatches: 0,
      remainingKnockoutMatches: 0,
    };
    remainingByClub.set(club, created);
    return created;
  }

  for (const group of Object.values(groups)) {
    for (const match of group.matches) {
      if (!isActionableUnplayedMatch(match, group, knockoutStartedKeys, withdrawnByGroup)) {
        continue;
      }

      const upside = maxPointsForUnplayedMatch(group);
      for (const club of [match.homeTeam, match.awayTeam]) {
        const entry = ensureClub(club);
        entry.remainingPoints += upside;
        if (group.isKnockout) {
          entry.remainingKnockoutMatches += 1;
        } else {
          entry.remainingGroupMatches += 1;
        }
      }
    }
  }

  return remainingByClub;
}

function countActionableUnplayedMatches(
  groups: Record<string, GroupData>,
  knockoutStartedKeys: Set<string>,
  withdrawnByGroup: Map<string, Set<string>>,
): number {
  let total = 0;

  for (const group of Object.values(groups)) {
    for (const match of group.matches) {
      if (isActionableUnplayedMatch(match, group, knockoutStartedKeys, withdrawnByGroup)) {
        total += 1;
      }
    }
  }

  return total;
}

export function calculateSeasonProjection(season: SeasonData): SeasonProjection {
  const challenge =
    season.challenge.length > 0 ? season.challenge : calculateVereinsChallenge(season.groups);
  const knockoutStartedKeys = buildKnockoutStartedKeys(season.groups);
  const withdrawnByGroup = buildWithdrawnTeamKeysByGroup(season.groups);
  const remainingByClub = collectRemainingUpside(
    season.groups,
    knockoutStartedKeys,
    withdrawnByGroup,
  );
  const totalUnplayedMatches = countActionableUnplayedMatches(
    season.groups,
    knockoutStartedKeys,
    withdrawnByGroup,
  );

  const leaderCurrentPoints = challenge[0]?.totalPoints ?? 0;

  const baseProjections = challenge.map((entry, index) => {
    const remaining =
      remainingByClub.get(entry.club) ??
      ({
        remainingPoints: 0,
        remainingGroupMatches: 0,
        remainingKnockoutMatches: 0,
      } satisfies ClubRemainingUpside);

    return {
      club: entry.club,
      currentPoints: entry.totalPoints,
      breakdown: entry.breakdown,
      remainingPoints: remaining.remainingPoints,
      maxPossiblePoints: entry.totalPoints + remaining.remainingPoints,
      remainingGroupMatches: remaining.remainingGroupMatches,
      remainingKnockoutMatches: remaining.remainingKnockoutMatches,
      currentRank: index + 1,
      bestCaseRank: 0,
      canStillWinChallenge: false,
      gapToLeader: Math.max(0, leaderCurrentPoints - entry.totalPoints),
    };
  });

  const topMaxPossiblePoints = Math.max(...baseProjections.map((entry) => entry.maxPossiblePoints), 0);

  const bestCaseOrder = [...baseProjections].sort(
    (a, b) =>
      b.maxPossiblePoints - a.maxPossiblePoints ||
      b.currentPoints - a.currentPoints ||
      a.club.localeCompare(b.club, "de"),
  );

  const bestCaseRankByClub = new Map(
    bestCaseOrder.map((entry, index) => [entry.club, index + 1] as const),
  );

  const clubs = baseProjections.map((entry) => ({
    ...entry,
    bestCaseRank: bestCaseRankByClub.get(entry.club) ?? entry.currentRank,
    canStillWinChallenge:
      totalUnplayedMatches > 0 && entry.maxPossiblePoints === topMaxPossiblePoints,
  }));

  return {
    clubs,
    totalUnplayedMatches,
    seasonInProgress: totalUnplayedMatches > 0,
    leaderCurrentPoints,
    topMaxPossiblePoints,
  };
}

export function getClubProjection(
  season: SeasonData,
  club: string,
): ClubChallengeProjection | null {
  return calculateSeasonProjection(season).clubs.find((entry) => entry.club === club) ?? null;
}
