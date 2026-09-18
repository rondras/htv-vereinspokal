"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RefreshButtonProps {
  year: number;
  onRefreshed?: () => void;
}

export function RefreshButton({ year, onRefreshed }: RefreshButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleRefresh() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year }),
      });

      const payload = (await response.json()) as { error?: string; groups?: number };
      if (!response.ok) {
        throw new Error(payload.error ?? "Aktualisierung fehlgeschlagen");
      }

      setMessage(`${payload.groups ?? 0} Gruppen aktualisiert`);
      onRefreshed?.();
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Fehler");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Lädt…" : "Jetzt aktualisieren"}
      </Button>
      {message ? <span className="text-xs text-zinc-500">{message}</span> : null}
    </div>
  );
}
