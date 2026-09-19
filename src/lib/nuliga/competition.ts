import type { GroupData, MatchRow } from "@/lib/types";

export function normalizeCompetitionKey(title: string): string {
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

export function buildKnockoutStartedKeys(groups: Record<string, GroupData>): Set<string> {
  const started = new Set<string>();

  for (const group of Object.values(groups)) {
    if (!group.isKnockout) continue;
    if (!group.matches.some((match) => match.isPlayed)) continue;
    started.add(normalizeCompetitionKey(group.title));
  }

  return started;
}

function teamMatchesInGroup(
  group: GroupData,
  teamId: string | undefined,
  teamName: string,
): MatchRow[] {
  return group.matches.filter(
    (match) =>
      match.homeTeamId === teamId ||
      match.awayTeamId === teamId ||
      match.homeTeam === teamName ||
      match.awayTeam === teamName,
  );
}

function inferWithdrawnTeamKeys(
  group: GroupData,
  knockoutStartedKeys: Set<string>,
): Set<string> {
  if (group.isKnockout || group.standings.length === 0) {
    return new Set();
  }

  const competitionKey = normalizeCompetitionKey(group.title);
  const knockoutStarted = knockoutStartedKeys.has(competitionKey);
  const maxPlayed = Math.max(...group.standings.map((standing) => standing.played), 0);
  const inferred = new Set<string>();

  for (const standing of group.standings) {
    if (standing.withdrawnAt) continue;

    const matches = teamMatchesInGroup(group, standing.teamId, standing.team);
    if (matches.length === 0) continue;

    const zeroActivity =
      standing.played === 0 && standing.wins === 0 && standing.losses === 0;
    const allUnplayed = matches.every(
      (match) => !match.isPlayed && !match.matchPoints.includes(":"),
    );

    if (zeroActivity && allUnplayed && (knockoutStarted || maxPlayed >= 3)) {
      if (standing.teamId) inferred.add(standing.teamId);
      inferred.add(standing.team);
    }
  }

  return inferred;
}

export function buildWithdrawnTeamKeysByGroup(
  groups: Record<string, GroupData>,
): Map<string, Set<string>> {
  const knockoutStartedKeys = buildKnockoutStartedKeys(groups);
  const map = new Map<string, Set<string>>();

  for (const [groupId, group] of Object.entries(groups)) {
    const keys = new Set<string>();

    for (const standing of group.standings) {
      if (!standing.withdrawnAt) continue;
      if (standing.teamId) keys.add(standing.teamId);
      keys.add(standing.team);
    }

    for (const key of inferWithdrawnTeamKeys(group, knockoutStartedKeys)) {
      keys.add(key);
    }

    if (keys.size > 0) {
      map.set(groupId, keys);
    }
  }

  return map;
}

export function isWithdrawnMatch(match: MatchRow): boolean {
  return match.note === "Zurückgezogen";
}

export function matchInvolvesWithdrawnTeam(
  match: MatchRow,
  group: GroupData,
  withdrawnByGroup: Map<string, Set<string>>,
): boolean {
  const withdrawn = withdrawnByGroup.get(group.id);
  if (!withdrawn) return false;

  const homeKey = match.homeTeamId ?? match.homeTeam;
  const awayKey = match.awayTeamId ?? match.awayTeam;
  return withdrawn.has(homeKey) || withdrawn.has(awayKey);
}
