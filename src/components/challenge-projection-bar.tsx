interface ChallengeProjectionBarProps {
  current: number;
  max: number;
}

export function ChallengeProjectionBar({ current, max }: ChallengeProjectionBarProps) {
  if (max <= 0) {
    return <span className="text-zinc-600">—</span>;
  }

  const pct = Math.min(100, Math.round((current / max) * 100));
  const hasUpside = max > current;

  return (
    <div className="flex min-w-[88px] flex-col gap-1">
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full transition-[width] duration-200 ease-out ${
            hasUpside ? "bg-emerald-400" : "bg-emerald-500/70"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] tabular-nums text-zinc-500">
        {current}/{max}
      </span>
    </div>
  );
}
