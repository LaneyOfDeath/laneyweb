"use client";

import { useState, useEffect, useCallback } from "react";
import { Trophy, RefreshCw, Calendar, CheckCircle } from "lucide-react";
import { clsx } from "clsx";

const LEAGUES = [
  { key: "epl", name: "Premier League", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { key: "laliga", name: "La Liga", flag: "🇪🇸" },
  { key: "bundesliga", name: "Bundesliga", flag: "🇩🇪" },
  { key: "seriea", name: "Serie A", flag: "🇮🇹" },
  { key: "nba", name: "NBA", flag: "🇺🇸" },
  { key: "nfl", name: "NFL", flag: "🏈" },
  { key: "mlb", name: "MLB", flag: "⚾" },
  { key: "nhl", name: "NHL", flag: "🏒" },
  { key: "f1", name: "Formula 1", flag: "🏎️" },
];

const VIEWS = ["table", "upcoming", "results"] as const;
type View = typeof VIEWS[number];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TableView({ data }: { data: any[] }) {
  if (!data.length) return <EmptyState msg="No standings data available" />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1e2a3a]">
            {["#", "Team", "P", "W", "D", "L", "GF", "GA", "GD", "Pts"].map((h) => (
              <th key={h} className="px-3 py-2 text-left text-[11px] font-semibold text-[#64748b] uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 20).map((row, i) => (
            <tr
              key={i}
              className={clsx(
                "border-b border-[#1e2a3a]/50 hover:bg-white/5 transition-colors",
                i < 4 && "border-l-2 border-l-cyan-500/50"
              )}
            >
              <td className="px-3 py-2.5 text-[#94a3b8] text-xs w-8">{row.intRank ?? i + 1}</td>
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  {row.strTeamBadge && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={row.strTeamBadge} alt="" className="w-5 h-5 object-contain" />
                  )}
                  <span className="text-white text-xs font-medium">{row.strTeam}</span>
                </div>
              </td>
              <td className="px-3 py-2.5 text-[#94a3b8] text-xs text-center">{row.intPlayed}</td>
              <td className="px-3 py-2.5 text-emerald-400 text-xs text-center">{row.intWin}</td>
              <td className="px-3 py-2.5 text-[#94a3b8] text-xs text-center">{row.intDraw}</td>
              <td className="px-3 py-2.5 text-red-400 text-xs text-center">{row.intLoss}</td>
              <td className="px-3 py-2.5 text-[#94a3b8] text-xs text-center">{row.intGoalsFor}</td>
              <td className="px-3 py-2.5 text-[#94a3b8] text-xs text-center">{row.intGoalsAgainst}</td>
              <td className={clsx("px-3 py-2.5 text-xs text-center", (Number(row.intGoalDifference) ?? 0) >= 0 ? "text-emerald-400" : "text-red-400")}>
                {row.intGoalDifference}
              </td>
              <td className="px-3 py-2.5 text-white text-xs font-bold text-center">{row.intPoints}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EventsView({ data, type }: { data: any[]; type: "upcoming" | "results" }) {
  if (!data.length) return <EmptyState msg={`No ${type} fixtures found`} />;
  return (
    <div className="space-y-2 p-4">
      {data.map((e, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 p-3 rounded-xl border border-[#1e2a3a] bg-[#0d1224] hover:border-[#2d3f55] transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {type === "upcoming"
              ? <Calendar className="w-3.5 h-3.5 text-[#64748b] flex-shrink-0" />
              : <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{e.strHomeTeam} vs {e.strAwayTeam}</p>
              <p className="text-[10px] text-[#64748b]">{e.dateEvent} · {e.strTime}</p>
            </div>
          </div>
          {(e.intHomeScore !== null && e.intHomeScore !== undefined) ? (
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={clsx("text-sm font-bold", Number(e.intHomeScore) > Number(e.intAwayScore) ? "text-white" : "text-[#94a3b8]")}>
                {e.intHomeScore}
              </span>
              <span className="text-[#64748b] text-xs">–</span>
              <span className={clsx("text-sm font-bold", Number(e.intAwayScore) > Number(e.intHomeScore) ? "text-white" : "text-[#94a3b8]")}>
                {e.intAwayScore}
              </span>
            </div>
          ) : (
            <span className="text-xs text-[#64748b] flex-shrink-0">{e.strTime ?? "TBD"}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-[#64748b]">
      <Trophy className="w-8 h-8 mb-3 opacity-30" />
      <p className="text-sm">{msg}</p>
    </div>
  );
}

export default function SportsDashboard() {
  const [league, setLeague] = useState("epl");
  const [view, setView] = useState<View>("table");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/sports?league=${league}&type=${view}`);
      if (!res.ok) throw new Error("API error");
      const json = await res.json();
      setData(json.data ?? []);
      setLastUpdate(new Date());
    } catch {
      setError("Sports data temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }, [league, view]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="flex flex-col h-full">
      {/* League selector */}
      <div className="px-4 py-3 border-b border-[#1e2a3a] overflow-x-auto">
        <div className="flex gap-1.5 min-w-max">
          {LEAGUES.map((l) => (
            <button
              key={l.key}
              onClick={() => setLeague(l.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                league === l.key
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                  : "bg-white/5 text-[#94a3b8] border border-[#1e2a3a] hover:bg-white/10"
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* View tabs */}
      <div className="px-4 py-2.5 border-b border-[#1e2a3a] flex items-center justify-between">
        <div className="flex gap-1">
          {VIEWS.map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 rounded text-xs font-medium capitalize transition-colors ${
                view === v ? "bg-white/10 text-white" : "text-[#64748b] hover:text-white"
              }`}
            >
              {v === "table" ? "Standings" : v === "upcoming" ? "Fixtures" : "Results"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-[#64748b]">
          {lastUpdate && <span>{lastUpdate.toLocaleTimeString()}</span>}
          <button onClick={fetchData} disabled={loading} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#94a3b8] hover:text-white transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="m-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
        )}
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-[#111827] animate-pulse" />
            ))}
          </div>
        ) : view === "table" ? (
          <TableView data={data} />
        ) : (
          <EventsView data={data} type={view} />
        )}
        <p className="px-4 pb-4 text-xs text-[#64748b]">Data via TheSportsDB free tier</p>
      </div>
    </div>
  );
}
