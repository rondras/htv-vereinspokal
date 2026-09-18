import Link from "next/link";
import { Trophy } from "lucide-react";

const links = [
  { href: "/", label: "Übersicht" },
  { href: "/ligen", label: "Ligen" },
  { href: "/regeln", label: "Regeln" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-zinc-50">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Trophy className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-none">HTV Vereinspokal</p>
            <p className="mt-1 text-xs text-zinc-500">Vereins-Challenge Tracker</p>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-zinc-400 transition-colors duration-150 ease-out hover:bg-zinc-900 hover:text-zinc-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
