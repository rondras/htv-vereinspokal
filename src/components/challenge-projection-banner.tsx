import type { SeasonProjection } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ChallengeProjectionBannerProps {
  projection: SeasonProjection;
  year: number;
}

export function ChallengeProjectionBanner({ projection, year }: ChallengeProjectionBannerProps) {
  const contenders = projection.clubs.filter((club) => club.canStillWinChallenge);

  if (!projection.seasonInProgress) {
    return (
      <Card className="border-zinc-800 bg-zinc-950/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Saison abgeschlossen</CardTitle>
          <CardDescription>
            HTV-Pokal {year} — alle Begegnungen ausgetragen. Maximalwerte entsprechen dem Endstand.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-sky-500/20 bg-sky-500/5">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">Noch offen</CardTitle>
          <Badge className="border-sky-500/30 bg-sky-500/10 text-sky-200">
            {projection.totalUnplayedMatches}{" "}
            {projection.totalUnplayedMatches === 1 ? "Begegnung" : "Begegnungen"}
          </Badge>
        </div>
        <CardDescription>
          Pro ausstehender Partie zählen bis zu +3 Punkte (Gruppe) bzw. +5 (K.O., inkl. 3:0-Bonus).
          Die Spalte <span className="text-zinc-300">Max</span> zeigt den bestmöglichen Vereinsstand.
        </CardDescription>
      </CardHeader>
      {contenders.length > 0 ? (
        <CardContent className="pt-0">
          <p className="text-sm text-zinc-400">
            <span className="text-zinc-300">Mathematisch noch an der Spitze möglich:</span>{" "}
            {contenders.map((club) => club.club).join(", ")}
            {contenders.length > 1 ? ` (bis zu ${projection.topMaxPossiblePoints} Punkte)` : ""}
          </p>
        </CardContent>
      ) : null}
    </Card>
  );
}
