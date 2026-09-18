"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AVAILABLE_SEASONS } from "@/lib/nuliga/constants";

interface SeasonSelectorProps {
  currentYear: number;
  basePath?: string;
  onNavigate?: (href: string, year: number) => void;
  disabled?: boolean;
}

export function SeasonSelector({
  currentYear,
  basePath = "/",
  onNavigate,
  disabled = false,
}: SeasonSelectorProps) {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    setSelectedYear(currentYear);
  }, [currentYear]);

  return (
    <select
      value={selectedYear}
      disabled={disabled}
      onChange={(event) => {
        const year = event.target.value;
        setSelectedYear(Number.parseInt(year, 10));
        const href = basePath === "/" ? `/?season=${year}` : `${basePath}?season=${year}`;
        if (onNavigate) {
          onNavigate(href, Number.parseInt(year, 10));
        } else {
          router.push(href);
        }
      }}
      className="h-9 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none transition-colors focus:border-emerald-500/50 disabled:cursor-wait disabled:opacity-60"
    >
      {AVAILABLE_SEASONS.map((year) => (
        <option key={year} value={year}>
          Saison {year}
        </option>
      ))}
    </select>
  );
}
