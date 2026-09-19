export interface SeasonSummary {
  year: number;
  championship: string;
  label: string;
}

export interface GroupLink {
  id: string;
  label: string;
  href: string;
  isKnockout: boolean;
}

export interface CompetitionRow {
  category: string;
  champions: GroupLink[];
  pros: GroupLink[];
  talents: GroupLink[];
}

export interface StandingRow {
  rank: number;
  team: string;
  teamId?: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: string;
  matchPoints: string;
  sets: string;
  games: string;
}

export interface MatchRow {
  date: string;
  day: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId?: string;
  awayTeamId?: string;
  matchPoints: string;
  sets: string;
  games: string;
  reportUrl?: string;
  note?: string;
  isPlayed: boolean;
}

export interface GroupData {
  id: string;
  title: string;
  championship: string;
  isKnockout: boolean;
  competition?: string;
  standings: StandingRow[];
  matches: MatchRow[];
  fetchedAt: string;
}

export interface ChallengeBreakdown {
  registeredTeams: number;
  groupWins: number;
  knockoutWins: number;
  cleanSweepBonus: number;
  walkoverMalus: number;
}

export interface ClubChallengeEntry {
  club: string;
  totalPoints: number;
  breakdown: ChallengeBreakdown;
  teams: string[];
}

export interface ClubChallengeProjection {
  club: string;
  currentPoints: number;
  breakdown: ChallengeBreakdown;
  remainingPoints: number;
  maxPossiblePoints: number;
  remainingGroupMatches: number;
  remainingKnockoutMatches: number;
  currentRank: number;
  bestCaseRank: number;
  canStillWinChallenge: boolean;
  gapToLeader: number;
}

export interface SeasonProjection {
  clubs: ClubChallengeProjection[];
  totalUnplayedMatches: number;
  seasonInProgress: boolean;
  leaderCurrentPoints: number;
  topMaxPossiblePoints: number;
}

export interface SeasonData {
  year: number;
  championship: string;
  label: string;
  competitions: CompetitionRow[];
  groups: Record<string, GroupData>;
  challenge: ClubChallengeEntry[];
  fetchedAt: string;
  cacheExpiresAt: string;
}

export interface CacheMeta {
  fetchedAt: string;
  expiresAt: string;
  source: string;
}
