"use client";

import { createContext, useContext, type ReactNode } from "react";

const SeasonDisplayContext = createContext<number | null>(null);

export function SeasonDisplayProvider({
  displayYear,
  children,
}: {
  displayYear: number;
  children: ReactNode;
}) {
  return (
    <SeasonDisplayContext.Provider value={displayYear}>{children}</SeasonDisplayContext.Provider>
  );
}

export function useDisplayYear(fallback: number): number {
  const displayYear = useContext(SeasonDisplayContext);
  return displayYear ?? fallback;
}
