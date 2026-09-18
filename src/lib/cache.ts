import fs from "fs/promises";
import os from "os";
import path from "path";
import type { SeasonData } from "@/lib/types";
import { CACHE_TTL_MS } from "@/lib/nuliga/constants";

declare global {
  // eslint-disable-next-line no-var
  var __htvSeasonCache: Map<number, SeasonData> | undefined;
}

const memoryCache = globalThis.__htvSeasonCache ?? new Map<number, SeasonData>();
globalThis.__htvSeasonCache = memoryCache;

function resolveCacheDir(): string {
  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), "htv-vereinspokal-cache");
  }

  return path.join(process.cwd(), ".cache");
}

const CACHE_DIR = resolveCacheDir();

async function ensureCacheDir(): Promise<boolean> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

function seasonFilePath(year: number): string {
  return path.join(CACHE_DIR, `season-${year}.json`);
}

export async function readSeasonCache(year: number): Promise<SeasonData | null> {
  const fromMemory = memoryCache.get(year);
  if (fromMemory) {
    return fromMemory;
  }

  try {
    const raw = await fs.readFile(seasonFilePath(year), "utf-8");
    const parsed = JSON.parse(raw) as SeasonData;
    memoryCache.set(year, parsed);
    return parsed;
  } catch {
    return null;
  }
}

export async function writeSeasonCache(data: SeasonData): Promise<void> {
  memoryCache.set(data.year, data);

  const canWrite = await ensureCacheDir();
  if (!canWrite) {
    return;
  }

  try {
    await fs.writeFile(seasonFilePath(data.year), JSON.stringify(data), "utf-8");
  } catch {
    // Memory cache is enough when the filesystem is unavailable.
  }
}

export function isCacheFresh(data: SeasonData | null, now = Date.now()): boolean {
  if (!data?.cacheExpiresAt) return false;
  return new Date(data.cacheExpiresAt).getTime() > now;
}

export function buildExpiry(now = Date.now()): string {
  return new Date(now + CACHE_TTL_MS).toISOString();
}
