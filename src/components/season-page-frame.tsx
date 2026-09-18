"use client";

import { Suspense, useEffect, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { RefreshButton } from "@/components/refresh-button";
import { SeasonDisplayProvider } from "@/components/season-display-context";
import { SeasonLoading } from "@/components/season-loading";
import { SeasonSelector } from "@/components/season-selector";

interface SeasonPageFrameProps {
  year: number;
  basePath?: string;
  header: ReactNode;
  children: ReactNode;
}

export function SeasonPageFrame({ year, basePath = "/", header, children }: SeasonPageFrameProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingYear, setLoadingYear] = useState<number | null>(null);

  useEffect(() => {
    setLoadingYear(null);
  }, [year]);

  function navigateSeason(href: string, nextYear: number) {
    setLoadingYear(nextYear);
    startTransition(() => {
      router.push(href);
    });
  }

  const displayYear = loadingYear ?? year;

  return (
    <SeasonDisplayProvider displayYear={displayYear}>
      <div className="space-y-8">
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            {header}
            <div className="flex flex-wrap items-center gap-3">
              <SeasonSelector
                currentYear={year}
                basePath={basePath}
                onNavigate={navigateSeason}
                disabled={isPending}
              />
              <RefreshButton year={displayYear} />
            </div>
          </div>
        </section>

        {isPending ? (
          <SeasonLoading year={displayYear} />
        ) : (
          <Suspense key={year} fallback={<SeasonLoading year={displayYear} />}>
            {children}
          </Suspense>
        )}
      </div>
    </SeasonDisplayProvider>
  );
}
