"use client";

import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-20 text-center">
      <h1 className="text-xl font-semibold text-zinc-100">Seite konnte nicht geladen werden</h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-500">
        nuLiga ist gerade nicht erreichbar oder die Saisondaten konnten nicht aktualisiert werden.
        Gespeicherte Daten werden verwendet, sobald verfügbar.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 transition-transform duration-150 ease-out active:scale-[0.97]"
        >
          Erneut versuchen
        </button>
        <Link
          href="/"
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-300 transition-transform duration-150 ease-out active:scale-[0.97]"
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
