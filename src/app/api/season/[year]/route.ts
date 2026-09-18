import { NextResponse } from "next/server";
import { getSeasonData, isValidSeasonYear } from "@/lib/nuliga/sync";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ year: string }> },
) {
  const { year: yearParam } = await params;
  const year = Number.parseInt(yearParam, 10);

  if (!isValidSeasonYear(year)) {
    return NextResponse.json({ error: "Ungültige Saison" }, { status: 404 });
  }

  const force = new URL(request.url).searchParams.get("refresh") === "1";

  try {
    const data = await getSeasonData(year, force);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync fehlgeschlagen";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
