"use client";

import { useState, useEffect, useCallback } from "react";
import { Gamepad2, Users, RefreshCw, Clock } from "lucide-react";

interface SteamGame {
  appid: number;
  name: string;
  developer: string;
  ccu: number;
  average_2weeks: number;
  price: number;
  genre: string;
  owners: string;
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function getRankColor(i: number): string {
  if (i === 0) return "text-yellow-400";
  if (i === 1) return "text-[#94a3b8]";
  if (i === 2) return "text-orange-600";
  return "text-[#64748b]";
}

export default function GamingDashboard() {
  const [steamGames, setSteamGames] = useState<SteamGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/gaming");
      if (!res.ok) throw new Error("API error");
      const json = await res.json();
      setSteamGames(json.steam ?? []);
      setLastUpdate(new Date());
    } catch {
      setError("Gaming data temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3600000); // 1 hour
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Steam Top 10 — Peak Concurrent Players</h2>
          <p className="text-xs text-[#64748b] mt-0.5">Based on current player counts via SteamSpy</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#64748b]">
          {lastUpdate && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#94a3b8] hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-[#111827] border border-[#1e2a3a] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {steamGames.map((game, i) => {
            const barWidth = steamGames[0]?.ccu ? (game.ccu / steamGames[0].ccu) * 100 : 0;
            return (
              <div
                key={game.appid}
                className="relative flex items-center gap-4 p-4 rounded-xl border border-[#1e2a3a] bg-[#111827] hover:border-[#2d3f55] transition-colors overflow-hidden"
              >
                {/* Progress bar background */}
                <div
                  className="absolute inset-0 bg-pink-500/5 rounded-xl"
                  style={{ width: `${barWidth}%` }}
                />

                {/* Rank */}
                <span className={`text-2xl font-black tabular-nums w-8 flex-shrink-0 ${getRankColor(i)}`}>
                  {i + 1}
                </span>

                {/* Steam thumbnail */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/capsule_sm_120.jpg`}
                  alt={game.name}
                  className="w-16 h-9 object-cover rounded flex-shrink-0"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{game.name}</p>
                  <p className="text-xs text-[#64748b] truncate">{game.developer}</p>
                  {game.genre && (
                    <p className="text-[10px] text-pink-400/70 mt-0.5">{game.genre}</p>
                  )}
                </div>

                {/* Stats */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0 text-right">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-pink-400" />
                    <span className="text-sm font-bold text-white tabular-nums">{formatNum(game.ccu)}</span>
                  </div>
                  <span className="text-[11px] text-[#64748b]">peak concurrent</span>
                  {game.average_2weeks > 0 && (
                    <span className="text-[10px] text-[#64748b]">avg {formatNum(game.average_2weeks)} min/2w</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* IGDB note */}
      <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-4">
        <div className="flex items-start gap-3">
          <Gamepad2 className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-white">Unlock IGDB charts</p>
            <p className="text-xs text-[#64748b] mt-1">
              Add <code className="text-pink-400">IGDB_CLIENT_ID</code> and{" "}
              <code className="text-pink-400">IGDB_CLIENT_SECRET</code> (from Twitch Developer Console,
              free) to <code className="text-cyan-400">.env.local</code> to enable top-rated &
              best-selling game charts from IGDB.
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-[#64748b]">
        Steam data via SteamSpy free API · Updates hourly · IGDB requires Twitch API key (free)
      </p>
    </div>
  );
}
