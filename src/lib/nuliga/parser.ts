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
      isKnockout: /k\.o|nebenrunde|hauptfeld/i.test(label),
    });
  });

  return links;
}

function isLeagueCategoryLabel(category: string): boolean {
  return Boolean(category) && category !== " " && category !== "HTV-Pokal";
}

function parseLegacyLeagueRow(
  category: string,
  groupsCellHtml: string,
  year: number,
): CompetitionRow {
  const links = extractGroupLinks(groupsCellHtml, year);
  const hauptfeld = links.filter((link) => /hauptfeld/i.test(link.label));
  const nebenrunde = links.filter((link) => /nebenrunde/i.test(link.label));
  const other = links.filter((link) => !/hauptfeld|nebenrunde/i.test(link.label));

  return {
    category,
    champions: hauptfeld,
    pros: other,
    talents: nebenrunde,
  };
}

export function parseLeaguePage(html: string, year: number): CompetitionRow[] {
  const $ = cheerio.load(html);
  const rows: CompetitionRow[] = [];

  $("table.result-set tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length === 0) return;

    const category = decodeEntities($(cells[0]).text());
    if (!isLeagueCategoryLabel(category)) return;

    if (cells.length >= 4) {
      rows.push({
        category,
        champions: extractGroupLinks($(cells[1]).html() ?? "", year),
        pros: extractGroupLinks($(cells[2]).html() ?? "", year),
        talents: extractGroupLinks($(cells[3]).html() ?? "", year),
      });
      return;
    }

    // HTV-Pokal 2023 and earlier seasons use a 2-column layout (Hauptfeld / Nebenrunde).
    if (cells.length === 2) {
      rows.push(parseLegacyLeagueRow(category, $(cells[1]).html() ?? "", year));
    }
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

function parseWithdrawnAt(cellText: string): string | undefined {
  const withdrawnMatch = cellText.match(/zurückgezogen\/gesperrt\s+am\s+'([^']+)'/i);
  if (withdrawnMatch?.[1]) {
    return withdrawnMatch[1];
  }

  if (/zurückgezogen|gesperrt/i.test(cellText)) {
    return "unbekannt";
  }

  return undefined;
}

function parseStandingTeamCell(
  $: cheerio.CheerioAPI,
  cell: Parameters<typeof $>[0],
): { name: string; id?: string; withdrawnAt?: string } {
  const team = parseTeamCell($, cell);
  const withdrawnAt = parseWithdrawnAt(decodeEntities($(cell).text()));
  return { ...team, withdrawnAt };
}

function parseMatchNote(rowText: string, reportText: string): string | undefined {
  if (/w\.o\./i.test(rowText)) {
    return "Walkover";
  }

  if (/zurückgezogen/i.test(reportText) || (/zurückgezogen/i.test(rowText) && !/\d+\s*:\s*\d+/.test(rowText))) {
    return "Zurückgezogen";
  }

  return undefined;
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
    // 2024+ includes Spielort between Nr. and teams; 2023 Nebenrunde omits it.
    if (headers.includes("spielort")) {
      return { home: 5, away: 6, matchPoints: 7, sets: 8, games: 9, report: 10 };
    }

    return { home: 4, away: 5, matchPoints: 6, sets: 7, games: 8, report: 9 };
  }

  return { home: 3, away: 4, matchPoints: 5, sets: 6, games: 7, report: 8 };
}

function looksLikeTeamName(name: string): boolean {
  return (
    Boolean(name) &&
    /[A-Za-zÄÖÜäöüß]/.test(name) &&
    !/^(viertel|halb|finale|achtel)/i.test(name) &&
    !/^spielfrei$/i.test(name)
  );
}

function isByeTeam(name: string): boolean {
  return /^spielfrei$/i.test(name);
}

function parseMatchScore(score: string): [number, number] | null {
  const match = score.match(/(\d+)\s*:\s*(\d+)/);
  if (!match) return null;
  return [Number.parseInt(match[1]!, 10), Number.parseInt(match[2]!, 10)];
}

function deriveStandingsFromMatches(matches: MatchRow[]): StandingRow[] {
  const stats = new Map<
    string,
    { team: string; teamId?: string; wins: number; draws: number; losses: number; played: number }
  >();

  function ensure(name: string, id?: string) {
    const key = id ?? name;
    if (!stats.has(key)) {
      stats.set(key, { team: name, teamId: id, wins: 0, draws: 0, losses: 0, played: 0 });
    }
    return stats.get(key)!;
  }

  for (const match of matches) {
    if (!match.isPlayed) continue;

    const [homeScore, awayScore] = parseMatchScore(match.matchPoints) ?? [];
    if (homeScore === undefined || awayScore === undefined) continue;

    const home = ensure(match.homeTeam, match.homeTeamId);
    const away = ensure(match.awayTeam, match.awayTeamId);
    home.played += 1;
    away.played += 1;

    if (homeScore > awayScore) {
      home.wins += 1;
      away.losses += 1;
    } else if (awayScore > homeScore) {
      away.wins += 1;
      home.losses += 1;
    } else {
      home.draws += 1;
      away.draws += 1;
    }
  }

  return Array.from(stats.values())
    .sort((a, b) => b.wins - a.wins || a.team.localeCompare(b.team, "de"))
    .map((entry, index) => ({
      rank: index + 1,
      team: entry.team,
      teamId: entry.teamId,
      played: entry.played,
      wins: entry.wins,
      draws: entry.draws,
      losses: entry.losses,
      points: String(entry.wins * 2 + entry.draws),
      matchPoints: "-",
      sets: "-",
      games: "-",
    }));
}

export function parseGroupPage(html: string, year: number, groupId: string): GroupData {
  const $ = cheerio.load(html);
  const title = decodeEntities($("h1").first().text());
  const isKnockout = /k\.o\.-phase|nebenrunde|hauptfeld/i.test(title);

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

          const team = parseStandingTeamCell($, cells[2]!);
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
            withdrawnAt: team.withdrawnAt,
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
          const homeIsBye = isByeTeam(home.name);
          const awayIsBye = isByeTeam(away.name);
          if (!looksLikeTeamName(home.name) && !homeIsBye) return;
          if (!looksLikeTeamName(away.name) && !awayIsBye) return;
          if (homeIsBye && awayIsBye) return;

          const matchPoints = decodeEntities($(cells[layout.matchPoints]).text());
          const sets = decodeEntities($(cells[layout.sets]).text());
          const games = decodeEntities($(cells[layout.games]).text());
          const reportCell = cells[layout.report]!;
          const reportLink = $(reportCell).find("a").attr("href");
          const reportText = decodeEntities($(reportCell).text());
          const rowText = decodeEntities($(row).text());
          const note = parseMatchNote(rowText, reportText);
          const isWithdrawn = note === "Zurückgezogen";
          const isPlayed =
            homeIsBye || awayIsBye || isWithdrawn
              ? true
              : Boolean(matchPoints && matchPoints !== "-" && matchPoints.includes(":"));

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

  const resolvedStandings =
    standings.length > 0 ? standings : !isKnockout ? deriveStandingsFromMatches(matches) : standings;

  return {
    id: groupId,
    title,
    championship: championshipSlug(year).replace(/\+/g, " "),
    isKnockout,
    standings: resolvedStandings,
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
