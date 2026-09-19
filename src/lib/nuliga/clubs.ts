import type {
  ClubChallengeEntry,
  ClubChallengeProjection,
  GroupData,
  MatchRow,
  SeasonData,
  StandingRow,
} from "@/lib/types";
import { readSeasonCache } from "@/lib/cache";
import { AVAILABLE_SEASONS } from "@/lib/nuliga/constants";
import { calculateVereinsChallenge } from "@/lib/nuliga/challenge";
import { getClubProjection } from "@/lib/nuliga/projection";
import { getClubTitlesInSeason, type ClubTitle } from "@/lib/nuliga/titles";

export interface TeamRegistration {
  groupId: string;
  teamId: string;
  club: string;
  groupTitle: string;
  isKnockoutGroup: boolean;
  standing?: StandingRow;
  groupWins: number;
  knockoutWins: number;
  cleanSweepBonus: number;
  walkoverMalus: number;
  challengePoints: number;
  playedMatches: number;
}

export interface TeamPathMatch extends MatchRow {
  phase: "Gruppenphase" | "K.O.-Phase";
  groupId: string;
  groupTitle: string;
  result: "Sieg" | "Niederlage" | "Unentschieden" | "Offen";
  isHome: boolean;
  opponent: string;
}

export interface TeamPath {
  club: string;
  groupId: string;
  teamId: string;
  groupTitle: string;
  groupPhaseTitle: string;
  standing?: StandingRow;
  groupMatches: TeamPathMatch[];
  knockoutMatches: TeamPathMatch[];
  stats: {
    groupWins: number;
    knockoutWins: number;
    cleanSweepBonus: number;
    walkoverMalus: number;
    challengePoints: number;
  };
}

export interface ClubProfile {
  club: string;
  challenge: ClubChallengeEntry;
  teams: TeamRegistration[];
}

export interface ClubChallengeHistoryEntry {
  year: number;
  rank: number;
  totalPoints: number;
  registeredTeams: number;
  participated: boolean;
}

export interface ClubPageData {
  profile: ClubProfile;
  rank: number;
  titles: ClubTitle[];
  challengeHistory: ClubChallengeHistoryEntry[];
  projection: ClubChallengeProjection | null;
}

function parseScore(score: string): [number, number] | null {
  const match = score.match(/(\d+)\s*:\s*(\d+)/);
  if (!match) return null;
  return [Number.parseInt(match[1]!, 10), Number.parseInt(match[2]!, 10)];
}

function matchInvolvesTeam(match: MatchRow, teamId: string, teamName: string): boolean {
  return (
    match.homeTeamId === teamId ||
    match.awayTeamId === teamId ||
    match.homeTeam === teamName ||
    match.awayTeam === teamName
  );
}

function classifyMatchResult(
  match: MatchRow,
  teamId: string,
  teamName: string,
): TeamPathMatch["result"] {
  if (!match.isPlayed) return "Offen";

  const [homeScore, awayScore] = parseScore(match.matchPoints) ?? [];
  if (homeScore === undefined || awayScore === undefined) return "Offen";
  if (homeScore === awayScore) return "Unentschieden";

  const isHome =
    match.homeTeamId === teamId ||
    (match.homeTeam === teamName && match.homeTeamId === teamId) ||
    match.homeTeam === teamName;
  const teamWon = (isHome && homeScore > awayScore) || (!isHome && awayScore > homeScore);
  return teamWon ? "Sieg" : "Niederlage";
}

function normalizeCompetitionKey(title: string): string {
  return title
    .replace(/^HTV-Pokal \d+\s*/i, "")
    .replace(/\s*Gr\.\s*\d+\s*$/i, "")
    .replace(/^K\.O\.-Phase:\s*/i, "")
    .replace(/\s*-?\s*K\.O\.-Phase\s*$/i, "")
    .replace(/\s*-?\s*HTV-Pokal Nebenrunde\s*$/i, "")
    .replace(/\s*-?\s*HTV-Pokal Hauptfeld\s*$/i, "")
    .trim()
    .toLowerCase();
}

function analyzeTeamMatches(
  group: GroupData,
  teamId: string,
  teamName: string,
): Pick<
  TeamRegistration,
  "groupWins" | "knockoutWins" | "cleanSweepBonus" | "walkoverMalus" | "challengePoints" | "playedMatches"
> {
  let groupWins = 0;
  let knockoutWins = 0;
  let cleanSweepBonus = 0;
  let walkoverMalus = 0;
  let playedMatches = 0;

  for (const match of group.matches) {
    if (!match.isPlayed || !matchInvolvesTeam(match, teamId, teamName)) continue;

    playedMatches += 1;
    const [homeScore, awayScore] = parseScore(match.matchPoints) ?? [];
    if (homeScore === undefined || awayScore === undefined || homeScore === awayScore) continue;

    const isHome = match.homeTeamId === teamId || match.homeTeam === teamName;
    const teamWon = (isHome && homeScore > awayScore) || (!isHome && awayScore > homeScore);
    const isCleanSweep = Math.max(homeScore, awayScore) === 3 && Math.min(homeScore, awayScore) === 0;
    const isWalkover = match.note === "Walkover" || /w\.o\./i.test(match.matchPoints);

    if (teamWon) {
      if (group.isKnockout) knockoutWins += 1;
      else groupWins += 1;
      if (isCleanSweep) cleanSweepBonus += 1;
    } else if (isWalkover) {
      walkoverMalus += 1;
    }
  }

  const challengePoints =
    1 +
    groupWins * 2 +
    knockoutWins * 4 +
    cleanSweepBonus * 1 -
    walkoverMalus * 1;

  return {
    groupWins,
    knockoutWins,
    cleanSweepBonus,
    walkoverMalus,
    challengePoints,
    playedMatches,
  };
}

function buildTeamRegistration(
  club: string,
  group: GroupData,
  standing: StandingRow,
): TeamRegistration {
  const teamId = standing.teamId ?? standing.team;
  const stats = analyzeTeamMatches(group, teamId, standing.team);

  return {
    groupId: group.id,
    teamId,
    club,
    groupTitle: group.title,
    isKnockoutGroup: group.isKnockout,
    standing,
    ...stats,
  };
}

export function buildClubProfiles(season: SeasonData): ClubProfile[] {
  const challenge = season.challenge.length > 0 ? season.challenge : calculateVereinsChallenge(season.groups);
  const challengeByClub = new Map(challenge.map((entry) => [entry.club, entry]));
  const teamsByClub = new Map<string, TeamRegistration[]>();

  for (const group of Object.values(season.groups)) {
    if (group.isKnockout) continue;

    for (const standing of group.standings) {
      const club = standing.team;
      const registration = buildTeamRegistration(club, group, standing);
      const existing = teamsByClub.get(club) ?? [];
      existing.push(registration);
      teamsByClub.set(club, existing);
    }
  }

  for (const entry of challenge) {
    if (!teamsByClub.has(entry.club)) {
      teamsByClub.set(entry.club, []);
    }
  }

  for (const group of Object.values(season.groups)) {
    for (const match of group.matches) {
      if (match.homeTeam && !teamsByClub.has(match.homeTeam)) {
        teamsByClub.set(match.homeTeam, []);
      }
      if (match.awayTeam && !teamsByClub.has(match.awayTeam)) {
        teamsByClub.set(match.awayTeam, []);
      }
    }
  }

  return Array.from(teamsByClub.entries())
    .map(([club, teams]) => ({
      club,
      challenge: challengeByClub.get(club) ?? {
        club,
        totalPoints: teams.reduce((sum, team) => sum + team.challengePoints, 0),
        breakdown: {
          registeredTeams: teams.length,
          groupWins: teams.reduce((sum, team) => sum + team.groupWins, 0),
          knockoutWins: teams.reduce((sum, team) => sum + team.knockoutWins, 0),
          cleanSweepBonus: teams.reduce((sum, team) => sum + team.cleanSweepBonus, 0),
          walkoverMalus: teams.reduce((sum, team) => sum + team.walkoverMalus, 0),
        },
        teams: teams.map((team) => team.teamId),
      },
      teams: teams.sort((a, b) => a.groupTitle.localeCompare(b.groupTitle, "de")),
    }))
    .sort((a, b) => b.challenge.totalPoints - a.challenge.totalPoints || a.club.localeCompare(b.club, "de"));
}

export function getClubProfile(season: SeasonData, club: string): ClubProfile | null {
  return buildClubProfiles(season).find((profile) => profile.club === club) ?? null;
}

export function buildClubChallengeHistoryEntry(
  year: number,
  profiles: ClubProfile[],
  club: string,
): ClubChallengeHistoryEntry {
  const index = profiles.findIndex((profile) => profile.club === club);
  if (index === -1) {
    return {
      year,
      rank: 0,
      totalPoints: 0,
      registeredTeams: 0,
      participated: false,
    };
  }

  const profile = profiles[index]!;
  return {
    year,
    rank: index + 1,
    totalPoints: profile.challenge.totalPoints,
    registeredTeams: profile.challenge.breakdown.registeredTeams,
    participated: true,
  };
}

export function buildClubPageData(
  season: SeasonData,
  club: string,
  challengeHistory: ClubChallengeHistoryEntry[],
): ClubPageData | null {
  const profiles = buildClubProfiles(season);
  const profile = profiles.find((entry) => entry.club === club);

  if (!profile) {
    return null;
  }

  return {
    profile,
    rank: profiles.findIndex((entry) => entry.club === club) + 1,
    titles: getClubTitlesInSeason(season, club),
    challengeHistory,
    projection: getClubProjection(season, club),
  };
}

export async function loadClubChallengeHistory(club: string): Promise<ClubChallengeHistoryEntry[]> {
  const entries = await Promise.all(
    AVAILABLE_SEASONS.map(async (year) => {
      const season = await readSeasonCache(year);
      if (!season) {
        return buildClubChallengeHistoryEntry(year, [], club);
      }

      const profiles = buildClubProfiles(season);
      return buildClubChallengeHistoryEntry(year, profiles, club);
    }),
  );

  return entries.sort((a, b) => b.year - a.year);
}

function toPathMatch(
  match: MatchRow,
  group: GroupData,
  teamId: string,
  teamName: string,
): TeamPathMatch {
  const isHome = match.homeTeamId === teamId || match.homeTeam === teamName;
  return {
    ...match,
    phase: group.isKnockout ? "K.O.-Phase" : "Gruppenphase",
    groupId: group.id,
    groupTitle: group.title,
    result: classifyMatchResult(match, teamId, teamName),
    isHome,
    opponent: isHome ? match.awayTeam : match.homeTeam,
  };
}

export function buildTeamPath(season: SeasonData, groupId: string, teamId: string): TeamPath | null {
  const group = season.groups[groupId];
  if (!group || group.isKnockout) return null;

  const standing = group.standings.find((row) => row.teamId === teamId || row.team === teamId);
  if (!standing) return null;

  const club = standing.team;
  const competitionKey = normalizeCompetitionKey(group.title);

  const groupMatches = group.matches
    .filter((match) => matchInvolvesTeam(match, teamId, club))
    .map((match) => toPathMatch(match, group, teamId, club));

  const knockoutMatches: TeamPathMatch[] = [];
  for (const koGroup of Object.values(season.groups)) {
    if (!koGroup.isKnockout) continue;
    if (normalizeCompetitionKey(koGroup.title) !== competitionKey) continue;

    for (const match of koGroup.matches) {
      if (!matchInvolvesTeam(match, teamId, club)) continue;
      if (match.homeTeam !== club && match.awayTeam !== club) continue;
      knockoutMatches.push(toPathMatch(match, koGroup, teamId, club));
    }
  }

  const allGroups = [group, ...Object.values(season.groups).filter((g) => g.isKnockout && normalizeCompetitionKey(g.title) === competitionKey)];
  let groupWins = 0;
  let knockoutWins = 0;
  let cleanSweepBonus = 0;
  let walkoverMalus = 0;

  for (const g of allGroups) {
    const stats = analyzeTeamMatches(g, teamId, club);
    groupWins += stats.groupWins;
    knockoutWins += stats.knockoutWins;
    cleanSweepBonus += stats.cleanSweepBonus;
    walkoverMalus += stats.walkoverMalus;
  }

  return {
    club,
    groupId,
    teamId,
    groupTitle: group.title,
    groupPhaseTitle: group.title,
    standing,
    groupMatches,
    knockoutMatches,
    stats: {
      groupWins,
      knockoutWins,
      cleanSweepBonus,
      walkoverMalus,
      challengePoints: 1 + groupWins * 2 + knockoutWins * 4 + cleanSweepBonus - walkoverMalus,
    },
  };
}
