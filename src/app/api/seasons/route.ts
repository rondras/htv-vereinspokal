import { NextResponse } from "next/server";
import { listSeasons } from "@/lib/nuliga/sync";

export async function GET() {
  return NextResponse.json({ seasons: listSeasons() });
}
