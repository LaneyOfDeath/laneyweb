"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Gamepad2, Users, RefreshCw, Search, Tv2, Gift, Calendar, Star, ExternalLink, X } from "lucide-react";
import LiveTimestamp from "@/components/LiveTimestamp";

// ── Types ────────────────────────────────────────────────────────────────────
interface SteamGame { appid: number; name: string; developer: string; ccu: number; average_2weeks: number; genre: string; }
interface Tv2Stream { id: string; userName: string; gameName: string; title: string; viewers: number; thumbnail: string; language: string; }
interface EpicGame { title: string; description: string; image: string; url: string; endDate: string; }
interface RAWGGame { id: number; name: string; released: string; rating: number; image: string; platforms: string[]; genres?: string[]; }

interface GamingData {
  steam: SteamGame[];
  twitch: Tv2Stream[];
  epicFree: EpicGame[];
  upcoming: RAWGGame[];
  timestamp: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

const TABS = [
  { id: "live",     label: "Live Now",     icon: Users },
  { id: "free",     label: "Free Games",   icon: Gift },
  { id: "releases", label: "Releases",     icon: Calendar },
  { id: "search",   label: "Search",       icon: Search },
] as const;
type Tab = typeof TABS[number]["id"];

// ── Sub-components ───────────────────────────────────────────────────────────

function SteamCard({ game, rank }: { game: SteamGame; rank: number }) {
  const rankColor = rank === 1 ? "text-yellow-400" : rank === 2 ? "text-slate-400" : rank === 3 ? "text-orange-500" : "text-[#64748b]";
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e2a3a]/60 hover:bg-white/5 transition-colors">
      <span className={`text-lg font-black w-6 flex-shrink-0 ${rankColor}`}>{rank}</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/capsule_sm_120.jpg`}
        alt={game.name} className="w-14 h-8 object-cover rounded flex-shrink-0"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white font-medium truncate">{game.name}</p>
        <p className="text-[10px] text-[#64748b] truncate">{game.developer}</p>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="text-xs font-bold text-pink-400">{fmt(game.ccu)}</p>
        <p className="text-[9px] text-[#64748b]">playing</p>
      </div>
    </div>
  );
}

function Tv2Card({ stream }: { stream: Tv2Stream }) {
  return (
    <a href={`https://www.twitch.tv/${stream.userName}`} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3 border-b border-[#1e2a3a]/60 hover:bg-white/5 transition-colors group">
      {stream.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={stream.thumbnail} alt={stream.userName} className="w-14 h-8 object-cover rounded flex-shrink-0" />
      ) : (
        <div className="w-14 h-8 bg-[#1e2a3a] rounded flex-shrink-0 flex items-center justify-center">
          <Tv2 className="w-4 h-4 text-purple-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white font-medium truncate group-hover:text-purple-300 transition-colors">{stream.userName}</p>
        <p className="text-[10px] text-purple-400 truncate">{stream.gameName}</p>
        <p className="text-[9px] text-[#64748b] truncate">{stream.title}</p>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="text-xs font-bold text-purple-400">{fmt(stream.viewers)}</p>
        <p className="text-[9px] text-[#64748b]">viewers</p>
      </div>
    </a>
  );
}

function EpicCard({ game }: { game: EpicGame }) {
  const endsIn = game.endDate ? Math.ceil((new Date(game.endDate).getTime() - Date.now()) / 86400000) : null;
  return (
    <a href={game.url} target="_blank" rel="noopener noreferrer"
      className="group flex flex-col rounded-xl border border-[#1e2a3a] bg-[#111827] overflow-hidden hover:border-[#2d3f55] transition-colors">
      {game.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={game.image} alt={game.title} className="w-full h-32 object-cover" />
      ) : (
        <div className="w-full h-32 bg-[#1e2a3a] flex items-center justify-center">
          <Gift className="w-8 h-8 text-[#64748b]" />
        </div>
      )}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-white font-semibold leading-tight group-hover:text-cyan-300 transition-colors">{game.title}</p>
          <ExternalLink className="w-3 h-3 text-[#64748b] flex-shrink-0 mt-0.5" />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/20 font-semibold">FREE</span>
          {endsIn !== null && <span className="text-[10px] text-[#64748b]">{endsIn > 0 ? `${endsIn}d left` : "Ends today"}</span>}
        </div>
      </div>
    </a>
  );
}

function RAWGCard({ game }: { game: RAWGGame }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e2a3a]/60 hover:bg-white/5 transition-colors">
      {game.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={game.image} alt={game.name} className="w-14 h-8 object-cover rounded flex-shrink-0" />
      ) : (
        <div className="w-14 h-8 bg-[#1e2a3a] rounded flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white font-medium truncate">{game.name}</p>
        <p className="text-[10px] text-[#64748b]">{game.released ?? "TBA"}</p>
        {game.genres && <p className="text-[9px] text-pink-400/70 truncate">{game.genres.join(", ")}</p>}
      </div>
      {game.rating > 0 && (
        <div className="flex-shrink-0 flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-400" />
          <span className="text-xs text-white">{game.rating.toFixed(1)}</span>
        </div>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function GamingDashboard() {
  const [tab, setTab] = useState<Tab>("live");
  const [data, setData] = useState<GamingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<RAWGGame[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchNoKey, setSearchNoKey] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gaming");
      const json = await res.json();
      setData(json);
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3600000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/gaming?search=${encodeURIComponent(q)}`);
      const json = await res.json();
      setSearchResults(json.results ?? []);
      setSearchNoKey(json.noKey ?? false);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSearch = (q: string) => {
    setSearchQ(q);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => doSearch(q), 500);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2a3a]">
        <div className="flex gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                tab === id
                  ? "bg-pink-500/20 text-pink-400 border-pink-500/30"
                  : "bg-white/5 text-[#94a3b8] border-[#1e2a3a] hover:bg-white/10"
              }`}>
              <Icon className="w-3 h-3" />{label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-[#64748b]">
          {lastUpdate && <LiveTimestamp date={lastUpdate} />}
          <button onClick={fetchData} disabled={loading}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#94a3b8] hover:text-white transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* ── LIVE NOW ── */}
        {tab === "live" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 h-full min-h-0">
            {/* Steam */}
            <div className="border-r border-[#1e2a3a] flex flex-col">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1e2a3a] bg-white/2">
                <Gamepad2 className="w-3.5 h-3.5 text-pink-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-pink-400">Steam — Top by Players</span>
              </div>
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-[#64748b] animate-spin" />
                </div>
              ) : data?.steam.length ? (
                data.steam.map((g, i) => <SteamCard key={g.appid} game={g} rank={i + 1} />)
              ) : (
                <div className="flex-1 flex items-center justify-center p-8 text-center">
                  <p className="text-xs text-[#64748b]">Steam data unavailable</p>
                </div>
              )}
            </div>

            {/* Tv2 */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1e2a3a] bg-white/2">
                <Tv2 className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400">Tv2 — Top Streams</span>
              </div>
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-[#64748b] animate-spin" />
                </div>
              ) : data?.twitch.length ? (
                data.twitch.map((s) => <Tv2Card key={s.id} stream={s} />)
              ) : (
                <div className="flex-1 flex items-center justify-center p-8 text-center">
                  <p className="text-xs text-[#64748b]">Add <code className="text-pink-400">IGDB_CLIENT_ID</code> + <code className="text-pink-400">IGDB_CLIENT_SECRET</code> in Vercel to enable Twitch streams</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── FREE GAMES ── */}
        {tab === "free" && (
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-4 h-4 text-green-400" />
              <h3 className="text-sm font-semibold text-white">Epic Games Store — Free Right Now</h3>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <RefreshCw className="w-6 h-6 text-[#64748b] animate-spin" />
              </div>
            ) : data?.epicFree.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.epicFree.map((g, i) => <EpicCard key={i} game={g} />)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Gift className="w-10 h-10 text-[#64748b] mb-3" />
                <p className="text-sm text-[#64748b]">No free games this week — check back soon</p>
              </div>
            )}
          </div>
        )}

        {/* ── RELEASES ── */}
        {tab === "releases" && (
          <div className="flex flex-col">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1e2a3a]">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">Upcoming Releases — Next 60 Days</span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <RefreshCw className="w-6 h-6 text-[#64748b] animate-spin" />
              </div>
            ) : !data?.upcoming.length ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-8">
                <Calendar className="w-10 h-10 text-[#64748b] mb-3" />
                <p className="text-sm text-[#64748b] mb-1">No release data</p>
                <p className="text-xs text-[#4a5568]">Add <code className="text-pink-400">RAWG_API_KEY</code> in Vercel (free at rawg.io) to enable releases & search</p>
              </div>
            ) : (
              data.upcoming.map((g) => <RAWGCard key={g.id} game={g} />)
            )}
          </div>
        )}

        {/* ── SEARCH ── */}
        {tab === "search" && (
          <div className="flex flex-col">
            <div className="px-4 py-3 border-b border-[#1e2a3a]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                <input
                  type="text"
                  value={searchQ}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search any game…"
                  className="w-full bg-[#111827] border border-[#1e2a3a] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-[#4a5568] focus:outline-none focus:border-pink-500/50 transition-colors"
                />
                {searchQ && (
                  <button onClick={() => { setSearchQ(""); setSearchResults([]); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {searchNoKey ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-8">
                <Search className="w-10 h-10 text-[#64748b] mb-3" />
                <p className="text-sm text-[#64748b] mb-1">Search requires a RAWG API key</p>
                <p className="text-xs text-[#4a5568]">Free at <code className="text-pink-400">rawg.io</code> — add as <code className="text-pink-400">RAWG_API_KEY</code> in Vercel</p>
              </div>
            ) : searchLoading ? (
              <div className="flex items-center justify-center py-16">
                <RefreshCw className="w-6 h-6 text-[#64748b] animate-spin" />
              </div>
            ) : searchResults.length ? (
              searchResults.map((g) => <RAWGCard key={g.id} game={g} />)
            ) : searchQ ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-sm text-[#64748b]">No results for &quot;{searchQ}&quot;</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Gamepad2 className="w-10 h-10 text-[#64748b] mb-3" />
                <p className="text-sm text-[#64748b]">Type a game name to search</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
