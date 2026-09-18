"use client";

import { useDisplayYear } from "@/components/season-display-context";

interface LigenSeasonHeaderProps {
  year: number;
}

export function LigenSeasonHeader({ year }: LigenSeasonHeaderProps) {
  const displayYear = useDisplayYear(year);

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Alle Ligen</h1>
      <p className="mt-2 text-zinc-400">
        Spielklassen, Gruppen und K.O.-Phasen für HTV-Pokal {displayYear}.
      </p>
    </div>
  );
}
