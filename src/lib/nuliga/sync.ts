import type { SeasonData } from "@/lib/types";
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

  const groupResults = await fetchWithConcurrency(
    groupLinks.map((g) => g.id),
    async (groupId) => {
      const html = await fetchHtml(groupPageUrl(year, groupId));
      return parseGroupPage(html, year, groupId);
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

export async function getSeasonData(year: number, force = false): Promise<SeasonData> {
  if (!force) {
    const cached = await readSeasonCache(year);
    if (cached) {
      if (isCacheFresh(cached)) {
        return cached;
      }
    }
  }

  return syncSeason(year, force);
}

export function listSeasons() {
  return AVAILABLE_SEASONS.map((year) => ({
    year,
    championship: championshipSlug(year).replace(/\+/g, " "),
    label: `HTV-Pokal ${year}`,
  }));
}
