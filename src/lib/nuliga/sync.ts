import type { GroupData, SeasonData } from "@/lib/types";
import {
  AVAILABLE_SEASONS,
  championshipSlug,
  groupPageUrl,
  leaguePageUrl,
} from "@/lib/nuliga/constants";
import { buildExpiry, isCacheFresh, readSeasonCache, writeSeasonCache } from "@/lib/cache";
import { calculateVereinsChallenge } from "@/lib/nuliga/challenge";
import { fetchHtml, fetchWithConcurrency } from "@/lib/nuliga/fetcher";
import {
  collectUniqueGroups,
  parseGroupPage,
  parseLeaguePage,
} from "@/lib/nuliga/parser";

export function isValidSeasonYear(year: number): boolean {
  return (AVAILABLE_SEASONS as readonly number[]).includes(year);
}

const inflightSyncs = new Map<number, Promise<SeasonData>>();

function emptyGroup(year: number, groupId: string, label: string): GroupData {
  return {
    id: groupId,
    title: label,
    championship: championshipSlug(year).replace(/\+/g, " "),
    isKnockout: /k\.o|nebenrunde|hauptfeld/i.test(label),
    standings: [],
    matches: [],
    fetchedAt: new Date().toISOString(),
  };
}

export async function syncSeason(year: number, force = false): Promise<SeasonData> {
  if (!force) {
    const cached = await readSeasonCache(year);
    if (isCacheFresh(cached)) {
      return cached!;
    }
  }

  const [adultsHtml, ageHtml] = await Promise.all([
    fetchHtml(leaguePageUrl(year, 2)),
    fetchHtml(leaguePageUrl(year, 3)),
  ]);

  const competitions = [...parseLeaguePage(adultsHtml, year), ...parseLeaguePage(ageHtml, year)];
  const groupLinks = collectUniqueGroups(competitions);

  const groupLinkById = new Map(groupLinks.map((link) => [link.id, link]));

  const groupResults = await fetchWithConcurrency(
    groupLinks.map((g) => g.id),
    async (groupId) => {
      const link = groupLinkById.get(groupId);
      try {
        const html = await fetchHtml(groupPageUrl(year, groupId));
        return parseGroupPage(html, year, groupId);
      } catch (error) {
        console.error(`Group ${groupId} sync failed for ${year}:`, error);
        return emptyGroup(year, groupId, link?.label ?? `Gruppe ${groupId}`);
      }
    },
    5,
  );

  const groups = Object.fromEntries(groupResults.map((group) => [group.id, group]));
  const now = new Date().toISOString();

  const season: SeasonData = {
    year,
    championship: championshipSlug(year).replace(/\+/g, " "),
    label: `HTV-Pokal ${year}`,
    competitions,
    groups,
    challenge: calculateVereinsChallenge(groups),
    fetchedAt: now,
    cacheExpiresAt: buildExpiry(),
  };

  await writeSeasonCache(season);
  return season;
}

async function syncSeasonDeduped(year: number, force = false): Promise<SeasonData> {
  if (!force) {
    const inflight = inflightSyncs.get(year);
    if (inflight) {
      return inflight;
    }
  }

  const promise = syncSeason(year, force);
  inflightSyncs.set(year, promise);

  try {
    return await promise;
  } finally {
    inflightSyncs.delete(year);
  }
}

export async function getSeasonData(year: number, force = false): Promise<SeasonData> {
  const cached = await readSeasonCache(year);

  if (!force && cached && isCacheFresh(cached)) {
    return cached;
  }

  try {
    return await syncSeasonDeduped(year, force);
  } catch (error) {
    if (cached) {
      console.error(`Season ${year} sync failed, returning stale cache:`, error);
      return cached;
    }
    throw error;
  }
}

export function listSeasons() {
  return AVAILABLE_SEASONS.map((year) => ({
    year,
    championship: championshipSlug(year).replace(/\+/g, " "),
    label: `HTV-Pokal ${year}`,
  }));
}
