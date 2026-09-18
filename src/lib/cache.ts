import fs from "fs/promises";
import path from "path";
import type { SeasonData } from "@/lib/types";
import { CACHE_TTL_MS } from "@/lib/nuliga/constants";

const CACHE_DIR = path.join(process.cwd(), ".cache");

async function ensureCacheDir(): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
}

function seasonFilePath(year: number): string {
  return path.join(CACHE_DIR, `season-${year}.json`);
}

export async function readSeasonCache(year: number): Promise<SeasonData | null> {
  try {
    const raw = await fs.readFile(seasonFilePath(year), "utf-8");
    return JSON.parse(raw) as SeasonData;
  } catch {
    return null;
  }
}

export async function writeSeasonCache(data: SeasonData): Promise<void> {
  await ensureCacheDir();
  await fs.writeFile(seasonFilePath(yearFromData(data)), JSON.stringify(data, null, 2), "utf-8");
}

function yearFromData(data: SeasonData): number {
  return data.year;
}

export function isCacheFresh(data: SeasonData | null, now = Date.now()): boolean {
  if (!data?.cacheExpiresAt) return false;
  return new Date(data.cacheExpiresAt).getTime() > now;
}

export function buildExpiry(now = Date.now()): string {
  return new Date(now + CACHE_TTL_MS).toISOString();
}
