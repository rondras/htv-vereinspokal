"use client";

import { useDisplayYear } from "@/components/season-display-context";

interface HomeSeasonHeaderProps {
  year: number;
}

export function HomeSeasonHeader({ year }: HomeSeasonHeaderProps) {
  const displayYear = useDisplayYear(year);

  return (
    <div>
      <p className="text-sm font-medium text-emerald-400">Hessischer Tennis-Verband</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
        HTV Vereinspokal {displayYear}
      </h1>
      <p className="mt-2 max-w-2xl text-zinc-400">
        Tabellen, Spielpläne und die Vereins-Challenge — synchronisiert von nuLiga, zwischengespeichert
        für eine Stunde.
      </p>
    </div>
  );
}
