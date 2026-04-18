"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Trophy, RefreshCw, Calendar, Clock, MapPin } from "lucide-react";
import { clsx } from "clsx";

const LEAGUES = [
  { key: "epl",        name: "Premier League",   flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", sport: "soccer"     },
  { key: "laliga",     name: "La Liga",           flag: "🇪🇸",       sport: "soccer"     },
  { key: "bundesliga", name: "Bundesliga",        flag: "🇩🇪",       sport: "soccer"     },
  { key: "seriea",     name: "Serie A",           flag: "🇮🇹",       sport: "soccer"     },
  { key: "ligue1",     name: "Ligue 1",           flag: "🇫🇷",       sport: "soccer"     },
  { key: "ucl",        name: "UCL",               flag: "🏆",        sport: "soccer"     },
  { key: "nba",        name: "NBA",               flag: "🏀",        sport: "basketball" },
  { key: "nfl",        name: "NFL",               flag: "🏈",        sport: "football"   },
  { key: "nhl",        name: "NHL",               flag: "🏒",        sport: "hockey"     },
  { key: "mlb",        name: "MLB",               flag: "⚾",        sport: "baseball"   },
  { key: "f1",         name: "Formula 1",         flag: "🏎️",        sport: "motorsport" },
];

const SOCCER_VIEWS  = ["scores", "standings", "fixtures", "results"] as const;
const US_VIEWS      = ["scores", "standings", "fixtures", "results"] as const;
const F1_VIEWS      = ["drivers", "constructors", "calendar"] as const;
type View = typeof SOCCER_VIEWS[number] | typeof F1_VIEWS[number];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MatchCard({ match, sport }: { match: any; sport: string }) {
  const isLive = match.state === "in";
  const isDone = match.state === "post";
  const homeWon = isDone && match.home.winner;
  const awayWon = isDone && match.away.winner;
  const showScore = isLive || isDone;

  const periodLabel = () => {
    if (!isLive) return null;
    if (sport === "soccer") return match.clock ? `${match.clock}` : "Live";
    if (sport === "basketball") return match.period ? `Q${match.period} ${match.clock ?? ""}` : "Live";
    if (sport === "hockey")     return match.period ? `P${match.period} ${match.clock ?? ""}` : "Live";
    if (sport === "baseball")   return match.period ? `Inn. ${match.period}` : "Live";
    if (sport === "football")   return match.period ? `Q${match.period} ${match.clock ?? ""}` : "Live";
    return match.clock ?? "Live";
  };

  return (
    <div className={clsx(
      "rounded-xl border bg-[#0d1224] p-3 transition-colors",
      isLive ? "border-green-500/40 bg-green-950/10" : "border-[#1e2a3a] hover:border-[#2d3f55]"
    )}>
      {/* Status row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {isLive ? (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {periodLabel()}
            </span>
          ) : isDone ? (
            <span className="text-[10px] text-[#64748b]">{match.status}</span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-[#64748b]">
              <Clock className="w-3 h-3" />
              {new Date(match.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
        {match.venue && (
          <span className="flex items-center gap-1 text-[10px] text-[#475569] truncate max-w-[140px]">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {match.venue}
          </span>
        )}
      </div>

      {/* Teams + score */}
      <div className="flex items-center gap-2">
        {/* Home */}
        <div className={clsx("flex items-center gap-2 flex-1 min-w-0", homeWon && "opacity-100", isDone && !homeWon && "opacity-60")}>
          {match.home.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={match.home.logo} alt="" className="w-6 h-6 object-contain flex-shrink-0" />
          )}
          <span className={clsx("text-xs font-semibold truncate", homeWon ? "text-white" : "text-[#94a3b8]")}>
            {match.home.name}
          </span>
        </div>

        {/* Score */}
        <div className="flex items-center gap-1.5 flex-shrink-0 px-2">
          {showScore ? (
            <>
              <span className={clsx("text-base font-bold w-5 text-center", homeWon ? "text-white" : "text-[#94a3b8]")}>{match.home.score}</span>
              <span className="text-[#475569] text-xs">–</span>
              <span className={clsx("text-base font-bold w-5 text-center", awayWon ? "text-white" : "text-[#94a3b8]")}>{match.away.score}</span>
            </>
          ) : (
            <span className="text-xs text-[#475569] font-medium px-1">
              {new Date(match.date).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
            </span>
          )}
        </div>

        {/* Away */}
        <div className={clsx("flex items-center gap-2 flex-1 min-w-0 justify-end", awayWon && "opacity-100", isDone && !awayWon && "opacity-60")}>
          <span className={clsx("text-xs font-semibold truncate text-right", awayWon ? "text-white" : "text-[#94a3b8]")}>
            {match.away.name}
          </span>
          {match.away.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={match.away.logo} alt="" className="w-6 h-6 object-contain flex-shrink-0" />
          )}
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SoccerStandings({ groups }: { groups: any[] }) {
  const entries = groups.flatMap((g: any) => g.entries ?? []).filter(Boolean);
  if (!entries.length) return <EmptyState msg="No standings available" />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#1e2a3a]">
            {["#", "Team", "P", "W", "D", "L", "GF", "GA", "GD", "Pts"].map(h => (
              <th key={h} className="px-2 py-2 text-left text-[10px] font-semibold text-[#64748b] uppercase tracking-wider whitespace-nowrap first:pl-4 last:pr-4">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((row: any, i: number) => (
            <tr key={i} className={clsx(
              "border-b border-[#1e2a3a]/40 hover:bg-white/5 transition-colors",
              i < 4 && "border-l-2 border-l-cyan-500/50",
              i >= entries.length - 3 && "border-l-2 border-l-red-500/50"
            )}>
              <td className="px-2 py-2 pl-4 text-[#64748b] w-7">
                <div className="flex items-center gap-1">
                  {row.rank}
                  {row.rankChange > 0 && <span className="text-green-400 text-[9px]">▲</span>}
                  {row.rankChange < 0 && <span className="text-red-400 text-[9px]">▼</span>}
                </div>
              </td>
              <td className="px-2 py-2">
                <div className="flex items-center gap-2">
                  {row.logo && <img src={row.logo} alt="" className="w-4 h-4 object-contain" />}
                  <span className="text-white font-medium whitespace-nowrap">{row.team}</span>
                </div>
              </td>
              <td className="px-2 py-2 text-[#64748b] text-center">{row.played}</td>
              <td className="px-2 py-2 text-emerald-400 text-center font-medium">{row.wins}</td>
              <td className="px-2 py-2 text-[#64748b] text-center">{row.draws}</td>
              <td className="px-2 py-2 text-red-400 text-center">{row.losses}</td>
              <td className="px-2 py-2 text-[#64748b] text-center">{Math.round(row.gf)}</td>
              <td className="px-2 py-2 text-[#64748b] text-center">{Math.round(row.ga)}</td>
              <td className={clsx("px-2 py-2 text-center", row.gd >= 0 ? "text-emerald-400" : "text-red-400")}>
                {row.gd > 0 ? "+" : ""}{Math.round(row.gd)}
              </td>
              <td className="px-2 py-2 pr-4 text-white font-bold text-center">{Math.round(row.points)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function USStandings({ groups, sport }: { groups: any[]; sport: string }) {
  if (!groups.length || !groups[0]?.entries?.length) return <EmptyState msg="No standings available" />;
  const isHockey = sport === "hockey";
  return (
    <div className="overflow-x-auto">
      {groups.map((group: any, gi: number) => (
        <div key={gi} className={gi > 0 ? "mt-4" : ""}>
          {groups.length > 1 && (
            <div className="px-4 py-1.5 bg-white/3 border-y border-[#1e2a3a]">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#64748b]">{group.groupName}</span>
            </div>
          )}
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1e2a3a]">
                {["#", "Team", "W", "L", isHockey ? "OTL" : null, "PCT", "GB"].filter(Boolean).map(h => (
                  <th key={h!} className="px-2 py-2 text-left text-[10px] font-semibold text-[#64748b] uppercase tracking-wider whitespace-nowrap first:pl-4 last:pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {group.entries.map((row: any, i: number) => (
                <tr key={i} className="border-b border-[#1e2a3a]/40 hover:bg-white/5 transition-colors">
                  <td className="px-2 py-2 pl-4 text-[#64748b] w-7">{row.rank || i + 1}</td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-2">
                      {row.logo && <img src={row.logo} alt="" className="w-4 h-4 object-contain" />}
                      <span className="text-white font-medium whitespace-nowrap">{row.team}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2 text-emerald-400 text-center font-medium">{row.wins}</td>
                  <td className="px-2 py-2 text-red-400 text-center">{row.losses}</td>
                  {isHockey && <td className="px-2 py-2 text-orange-400 text-center">{row.otl}</td>}
                  <td className="px-2 py-2 text-[#94a3b8] text-center">{row.pct ? (row.pct * 100).toFixed(1) + "%" : "–"}</td>
                  <td className="px-2 py-2 pr-4 text-[#64748b] text-center">{row.gb > 0 ? row.gb : "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function F1Drivers({ data }: { data: any[] }) {
  if (!data.length) return <EmptyState msg="No driver standings available" />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#1e2a3a]">
            {["Pos", "Driver", "Team", "Pts", "Wins"].map(h => (
              <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold text-[#64748b] uppercase tracking-wider first:pl-4">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((d: any, i: number) => (
            <tr key={i} className="border-b border-[#1e2a3a]/40 hover:bg-white/5">
              <td className="px-3 py-2.5 pl-4 text-[#64748b] font-semibold">{d.position}</td>
              <td className="px-3 py-2.5">
                <div>
                  <span className="text-white font-semibold">{d.name}</span>
                  <span className="ml-1.5 text-[10px] text-[#475569]">{d.code}</span>
                </div>
              </td>
              <td className="px-3 py-2.5 text-[#94a3b8]">{d.team}</td>
              <td className="px-3 py-2.5 text-orange-400 font-bold">{d.points}</td>
              <td className="px-3 py-2.5 text-[#64748b]">{d.wins}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function F1Constructors({ data }: { data: any[] }) {
  if (!data.length) return <EmptyState msg="No constructor standings available" />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#1e2a3a]">
            {["Pos", "Constructor", "Pts", "Wins"].map(h => (
              <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold text-[#64748b] uppercase tracking-wider first:pl-4">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((d: any, i: number) => (
            <tr key={i} className="border-b border-[#1e2a3a]/40 hover:bg-white/5">
              <td className="px-3 py-2.5 pl-4 text-[#64748b] font-semibold">{d.position}</td>
              <td className="px-3 py-2.5 text-white font-semibold">{d.team}</td>
              <td className="px-3 py-2.5 text-orange-400 font-bold">{d.points}</td>
              <td className="px-3 py-2.5 text-[#64748b]">{d.wins}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function F1Calendar({ data }: { data: any[] }) {
  if (!data.length) return <EmptyState msg="No race calendar available" />;
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="divide-y divide-[#1e2a3a]/50">
      {data.map((race: any) => {
        const isPast = race.date < today;
        const isNext = !isPast && data.find((r: any) => r.date >= today)?.round === race.round;
        return (
          <div key={race.round} className={clsx(
            "flex items-center gap-3 px-4 py-2.5 hover:bg-white/5",
            isPast && "opacity-40",
            isNext && "bg-orange-500/5 border-l-2 border-l-orange-400"
          )}>
            <span className="text-[10px] font-bold text-[#475569] w-6 text-center flex-shrink-0">R{race.round}</span>
            <div className="flex-1 min-w-0">
              <p className={clsx("text-xs font-semibold truncate", isNext ? "text-orange-400" : "text-white")}>{race.name}</p>
              <p className="text-[10px] text-[#64748b] truncate">{race.circuit} · {race.country}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 text-[10px] text-[#64748b]">
              <Calendar className="w-3 h-3" />
              {new Date(race.date + "T12:00:00").toLocaleDateString([], { day: "numeric", month: "short" })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-[#64748b]">
      <Trophy className="w-7 h-7 mb-3 opacity-25" />
      <p className="text-xs">{msg}</p>
    </div>
  );
}

export default function SportsDashboard() {
  const [league, setLeague]   = useState("epl");
  const [view,   setView]     = useState<View>("scores");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data,   setData]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const fetchIdRef = useRef(0);

  const sport = LEAGUES.find(l => l.key === league)?.sport ?? "soccer";

  const views: readonly string[] = sport === "motorsport" ? F1_VIEWS : SOCCER_VIEWS;

  const fetchData = useCallback(async () => {
    const id = ++fetchIdRef.current;
    setData(null);
    setLoading(true);
    try {
      const res  = await fetch(`/api/sports?league=${league}&type=${view}`);
      const json = await res.json();
      if (id !== fetchIdRef.current) return; // stale response — a newer fetch is in flight
      setData(json.data ?? null);
      setLastUpdate(new Date());
    } catch {
      if (id === fetchIdRef.current) setData(null);
    } finally {
      if (id === fetchIdRef.current) setLoading(false);
    }
  }, [league, view]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // When league changes, reset to first view for that sport
  const handleLeagueChange = (key: string) => {
    const newSport = LEAGUES.find(l => l.key === key)?.sport ?? "soccer";
    const defaultView = newSport === "motorsport" ? "drivers" : "scores";
    setData(null);
    setLeague(key);
    setView(defaultView as View);
  };

  const viewLabel = (v: string) => {
    const map: Record<string, string> = {
      scores: "Scores", standings: "Standings", fixtures: "Fixtures",
      results: "Results", drivers: "Drivers", constructors: "Constructors", calendar: "Calendar",
    };
    return map[v] ?? v;
  };

  const renderContent = () => {
    if (loading) return (
      <div className="p-3 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-[#111827] animate-pulse" />
        ))}
      </div>
    );
    if (!data || (Array.isArray(data) && !data.length)) return <EmptyState msg="No data available" />;

    if (view === "drivers")      return <F1Drivers data={data} />;
    if (view === "constructors") return <F1Constructors data={data} />;
    if (view === "calendar")     return <F1Calendar data={data} />;

    if (view === "standings") {
      if (sport === "soccer") return <SoccerStandings groups={data} />;
      return <USStandings groups={data} sport={sport} />;
    }

    // scores / fixtures / results — list of match cards
    const matches = Array.isArray(data) ? data : [];
    if (!matches.length) return <EmptyState msg={`No ${view} found`} />;
    return (
      <div className="p-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {matches.map((m: any, i: number) => (
          <MatchCard key={m.id ?? i} match={m} sport={sport} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* League selector */}
      <div className="px-3 py-2.5 border-b border-[#1e2a3a] overflow-x-auto">
        <div className="flex gap-1.5 min-w-max">
          {LEAGUES.map(l => (
            <button key={l.key} onClick={() => handleLeagueChange(l.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                league === l.key
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                  : "bg-white/5 text-[#94a3b8] border border-[#1e2a3a] hover:bg-white/10"
              }`}>
              <span>{l.flag}</span>
              <span>{l.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* View tabs + refresh */}
      <div className="px-4 py-2 border-b border-[#1e2a3a] flex items-center justify-between">
        <div className="flex gap-0.5">
          {views.map(v => (
            <button key={v} onClick={() => { setData(null); setView(v as View); }}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                view === v ? "bg-white/10 text-white" : "text-[#64748b] hover:text-[#94a3b8]"
              }`}>
              {viewLabel(v)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-[#64748b]">
          {lastUpdate && <span>{lastUpdate.toLocaleTimeString()}</span>}
          <button onClick={fetchData} disabled={loading}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#94a3b8] hover:text-white transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {renderContent()}
        <p className="px-4 pb-3 text-[10px] text-[#64748b]">
          {sport === "motorsport" ? "Data via Jolpica (Ergast)" : "Data via ESPN · Scores may be delayed"}
        </p>
      </div>
    </div>
  );
}
