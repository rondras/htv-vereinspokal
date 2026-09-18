"use client";

import { useRouter } from "next/navigation";
import { AVAILABLE_SEASONS } from "@/lib/nuliga/constants";

interface SeasonSelectorProps {
  currentYear: number;
  basePath?: string;
}

export function SeasonSelector({ currentYear, basePath = "/" }: SeasonSelectorProps) {
  const router = useRouter();

  return (
    <select
      value={currentYear}
      onChange={(event) => {
        const year = event.target.value;
        router.push(basePath === "/" ? `/?season=${year}` : `${basePath}?season=${year}`);
      }}
      className="h-9 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none transition-colors focus:border-emerald-500/50"
    >
      {AVAILABLE_SEASONS.map((year) => (
        <option key={year} value={year}>
          Saison {year}
        </option>
      ))}
    </select>
  );
}
