import { NextResponse } from "next/server";
import { DEFAULT_SEASON_YEAR } from "@/lib/nuliga/constants";
import { isValidSeasonYear, syncSeason } from "@/lib/nuliga/sync";

export async function POST(request: Request) {
  let year = DEFAULT_SEASON_YEAR;

  try {
    const body = (await request.json()) as { year?: number };
    if (body.year && isValidSeasonYear(body.year)) {
      year = body.year;
    }
  } catch {
    // use default year
  }

  try {
    const data = await syncSeason(year, true);
    return NextResponse.json({
      ok: true,
      year: data.year,
      fetchedAt: data.fetchedAt,
      groups: Object.keys(data.groups).length,
      clubs: data.challenge.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Refresh fehlgeschlagen";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
