export const NULIGA_BASE = "https://htv.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa";

export const DEFAULT_SEASON_YEAR = 2026;

export const AVAILABLE_SEASONS = [2026, 2025, 2024, 2023] as const;

export const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export function championshipSlug(year: number): string {
  return `HTV-Pokal+${year}`;
}

export function leaguePageUrl(year: number, tab: 2 | 3 = 2): string {
  return `${NULIGA_BASE}/leaguePage?championship=${championshipSlug(year)}&tab=${tab}`;
}

export function groupPageUrl(year: number, groupId: string): string {
  return `${NULIGA_BASE}/groupPage?championship=${championshipSlug(year)}&group=${groupId}`;
}

export const RULES = {
  title: "HTV-Pokal Durchführungsbestimmungen",
  pdfUrl:
    "https://www.tennis.de/content/dam/tennis/lv/htv/wettbewerbe/team-tennis/htv-pokal/HTV-Pokal_Durchfuehrungsbestimmungen_2026.pdf.coredownload.inline.pdf",
  infoUrl: "https://www.tennis.de/htv/wettbewerbe/team-tennis/htv-pokal.html",
  nuligaUrl: "https://htv.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa/leaguePage?championship=HTV-Pokal+2026",
  challengePoints: [
    { label: "Gemeldete Mannschaft", points: 1 },
    { label: "Sieg Gruppenphase", points: 2 },
    { label: "Sieg K.O.-Phase", points: 4 },
    { label: "Bonus 3:0 Teamsieg", points: 1 },
    { label: "Malus Walkover", points: -1 },
  ],
  competitions: [
    { age: "Aktive", tiers: ["Champions LK 1–25", "Pros LK 10–25", "Talents LK 18–25"] },
    { age: "35+", tiers: ["Champions LK 1–25", "Pros LK 10–25", "Talents LK 18–25"] },
    { age: "50+", tiers: ["Champions LK 1–25", "Pros LK 10–25", "Talents LK 18–25"] },
  ],
} as const;
