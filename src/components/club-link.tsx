import Link from "next/link";
import { clubToSlug } from "@/lib/slug";
import { cn } from "@/lib/utils";

interface ClubLinkProps {
  club: string;
  year: number;
  className?: string;
}

export function ClubLink({ club, year, className }: ClubLinkProps) {
  if (!club) {
    return <span className={className}>{club}</span>;
  }

  return (
    <Link
      href={`/verein/${year}/${clubToSlug(club)}`}
      className={cn(
        "font-medium text-zinc-100 transition-colors duration-150 ease-out hover:text-emerald-400",
        className,
      )}
    >
      {club}
    </Link>
  );
}
