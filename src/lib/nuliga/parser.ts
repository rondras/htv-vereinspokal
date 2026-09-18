import * as cheerio from "cheerio";
import type { CompetitionRow, GroupData, GroupLink, MatchRow, StandingRow } from "@/lib/types";
import { championshipSlug, groupPageUrl } from "@/lib/nuliga/constants";

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractGroupLinks(cellHtml: string, year: number): GroupLink[] {
  const $ = cheerio.load(`<div>${cellHtml}</div>`);
  const links: GroupLink[] = [];

  $("a").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const label = decodeEntities($(el).text());
    const groupMatch = href.match(/group=(\d+)/);
    if (!groupMatch || !label) return;

    links.push({
      id: groupMatch[1]!,
      label,
      href: groupPageUrl(year, groupMatch[1]!),
      isKnockout: /k\.o/i.test(label),
    });
  });

  return links;
}

export function parseLeaguePage(html: string, year: number): CompetitionRow[] {
  const $ = cheerio.load(html);
  const rows: CompetitionRow[] = [];

  $("table.result-set tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 4) return;

    const category = decodeEntities($(cells[0]).text());
    if (!category || category === " ") return;

    rows.push({
      category,
      champions: extractGroupLinks($(cells[1]).html() ?? "", year),
      pros: extractGroupLinks($(cells[2]).html() ?? "", year),
      talents: extractGroupLinks($(cells[3]).html() ?? "", year),
    });
  });

  return rows;
}

function parseTeamCell($: cheerio.CheerioAPI, cell: Parameters<typeof $>[0]): { name: string; id?: string } {
  const link = $(cell).find("a").first();
  const name = decodeEntities(link.text() || $(cell).text());
  const href = link.attr("href") ?? "";
  const teamMatch = href.match(/team=(\d+)/);
  return { name, id: teamMatch?.[1] };
}

function parseIntSafe(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

interface MatchColumnLayout {
  home: number;
  away: number;
  matchPoints: number;
  sets: number;
  games: number;
  report: number;
}

function resolveMatchColumnLayout(headers: string[], cellCount: number): MatchColumnLayout {
  const isKnockoutSchedule = headers.includes("nr.") || cellCount >= 11;

  if (isKnockoutSchedule) {
    return { home: 5, away: 6, matchPoints: 7, sets: 8, games: 9, report: 10 };
  }

  return { home: 3, away: 4, matchPoints: 5, sets: 6, games: 7, report: 8 };
}

function looksLikeTeamName(name: string): boolean {
  return Boolean(name) && /[A-Za-zÄÖÜäöüß]/.test(name) && !/^(viertel|halb|finale|achtel)/i.test(name);
}

export function parseGroupPage(html: string, year: number, groupId: string): GroupData {
  const $ = cheerio.load(html);
  const title = decodeEntities($("h1").first().text());
  const isKnockout = /k\.o\.-phase/i.test(title);

  const tables = $("table.result-set").toArray();
  const standings: StandingRow[] = [];
  const matches: MatchRow[] = [];

  for (const table of tables) {
    const headers = $(table)
      .find("tr")
      .first()
      .find("th")
      .map((_, th) => decodeEntities($(th).text()).toLowerCase())
      .get();

    if (headers.includes("rang") && headers.includes("mannschaft")) {
      $(table)
        .find("tr")
        .slice(1)
        .each((_, row) => {
          const cells = $(row).find("td");
          if (cells.length < 10) return;

          const team = parseTeamCell($, cells[2]!);
          if (!team.name) return;

          standings.push({
            rank: parseIntSafe(decodeEntities($(cells[1]).text())),
            team: team.name,
            teamId: team.id,
            played: parseIntSafe(decodeEntities($(cells[3]).text())),
            wins: parseIntSafe(decodeEntities($(cells[4]).text())),
            draws: parseIntSafe(decodeEntities($(cells[5]).text())),
            losses: parseIntSafe(decodeEntities($(cells[6]).text())),
            points: decodeEntities($(cells[7]).text()),
            matchPoints: decodeEntities($(cells[8]).text()),
            sets: decodeEntities($(cells[9]).text()),
            games: decodeEntities($(cells[10]).text()),
          });
        });
    }

    if (headers.includes("heimmannschaft") && headers.includes("gastmannschaft")) {
      $(table)
        .find("tr")
        .slice(1)
        .each((_, row) => {
          const cells = $(row).find("td");
          if (cells.length < 9) return;

          const layout = resolveMatchColumnLayout(headers, cells.length);
          if (cells.length <= layout.report) return;

          const day = decodeEntities($(cells[0]).text());
          const date = decodeEntities($(cells[1]).text());
          const home = parseTeamCell($, cells[layout.home]!);
          const away = parseTeamCell($, cells[layout.away]!);
          if (!looksLikeTeamName(home.name) || !looksLikeTeamName(away.name)) return;

          const matchPoints = decodeEntities($(cells[layout.matchPoints]).text());
          const sets = decodeEntities($(cells[layout.sets]).text());
          const games = decodeEntities($(cells[layout.games]).text());
          const reportLink = $(cells[layout.report]).find("a").attr("href");
          const rowText = decodeEntities($(row).text());
          const note = /w\.o\./i.test(rowText) ? "Walkover" : undefined;
          const isPlayed = Boolean(matchPoints && matchPoints !== "-" && matchPoints.includes(":"));

          matches.push({
            day,
            date,
            homeTeam: home.name,
            awayTeam: away.name,
            homeTeamId: home.id,
            awayTeamId: away.id,
            matchPoints,
            sets,
            games,
            reportUrl: reportLink
              ? reportLink.startsWith("http")
                ? reportLink
                : `https://htv.liga.nu${reportLink}`
              : undefined,
            note,
            isPlayed,
          });
        });
    }
  }

  return {
    id: groupId,
    title,
    championship: championshipSlug(year).replace(/\+/g, " "),
    isKnockout,
    standings,
    matches,
    fetchedAt: new Date().toISOString(),
  };
}

export function collectUniqueGroups(competitions: CompetitionRow[]): GroupLink[] {
  const map = new Map<string, GroupLink>();

  for (const row of competitions) {
    for (const link of [...row.champions, ...row.pros, ...row.talents]) {
      map.set(link.id, link);
    }
  }

  return Array.from(map.values());
}
