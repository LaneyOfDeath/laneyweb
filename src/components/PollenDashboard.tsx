"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Search, X, Flower2 } from "lucide-react";
import { clsx } from "clsx";
import LiveTimestamp from "@/components/LiveTimestamp";

interface PollenValues {
  grass: number | null;
  birch: number | null;
  alder: number | null;
  mugwort: number | null;
  ragweed: number | null;
}

interface ForecastDay extends PollenValues { date: string }

interface PollenData {
  location: { name: string; country: string };
  current: PollenValues;
  forecast: ForecastDay[];
  timestamp: number;
}

type Risk = { label: string; color: string; score: number };

function risk(value: number | null): Risk {
  if (value === null || value < 0) return { label: "None",      color: "#64748b", score: 0 };
  if (value < 10)                  return { label: "Low",       color: "#10b981", score: 1 };
  if (value < 50)                  return { label: "Moderate",  color: "#f59e0b", score: 2 };
  if (value < 200)                 return { label: "High",      color: "#f97316", score: 3 };
  return                                  { label: "Very High", color: "#ef4444", score: 4 };
}

function overallRisk(vals: PollenValues): Risk {
  return TYPES.map(t => risk(vals[t.key])).reduce((best, r) => r.score > best.score ? r : best);
}

const TYPES: { key: keyof PollenValues; label: string; season: string }[] = [
  { key: "grass",   label: "Grass",   season: "Jun–Aug" },
  { key: "birch",   label: "Birch",   season: "Apr–May" },
  { key: "alder",   label: "Alder",   season: "Jan–Apr" },
  { key: "mugwort", label: "Mugwort", season: "Jul–Sep" },
  { key: "ragweed", label: "Ragweed", season: "Aug–Oct" },
];

const UK_CITIES = ["London","Birmingham","Manchester","Bristol","Leeds","Edinburgh","Cardiff","Belfast"];

function dayLabel(dateStr: string): string {
  const today    = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  if (dateStr === today)    return "Today";
  if (dateStr === tomorrow) return "Tom";
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short" });
}

export default function PollenDashboard() {
  const [data, setData]       = useState<PollenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [city, setCity]       = useState("London");
  const [search, setSearch]   = useState("");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async (target: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/pollen?city=${encodeURIComponent(target)}`);
      if (!res.ok) throw new Error();
      setData(await res.json());
      setLastUpdate(new Date());
    } catch {
      setError(`Could not find pollen data for "${target}"`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(city); }, [fetchData]);

  const handleSearch = () => {
    if (!search.trim()) return;
    const next = search.trim();
    setCity(next);
    fetchData(next);
    setSearch("");
  };

  const overall = data ? overallRisk(data.current) : null;
  const primaryType = data
    ? TYPES.reduce((best, t) => risk(data.current[t.key]).score > risk(data.current[best.key]).score ? t : best, TYPES[0])
    : null;

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      {/* Search */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 bg-[#111827] border border-[#1e2a3a] rounded-xl px-3 py-2 flex-1 max-w-72">
          <Search className="w-4 h-4 text-[#64748b]" />
          <input
            type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Search any city…"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-[#64748b] outline-none"
          />
          {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-[#64748b]" /></button>}
        </div>
        <button onClick={handleSearch} className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl text-sm font-medium hover:bg-green-500/30 transition-colors">
          Search
        </button>
        <button onClick={() => fetchData(city)} className="p-2 bg-white/5 border border-[#1e2a3a] rounded-xl text-[#94a3b8] hover:text-white transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
        {lastUpdate && <LiveTimestamp date={lastUpdate} />}
      </div>

      {/* City pills */}
      <div className="flex flex-wrap gap-1.5">
        {UK_CITIES.map(c => (
          <button key={c} onClick={() => { setCity(c); fetchData(c); }}
            className={clsx("px-2.5 py-1 rounded-lg text-xs transition-colors border",
              city === c
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-white/5 text-[#64748b] border-[#1e2a3a] hover:text-white hover:bg-white/10"
            )}>
            {c}
          </button>
        ))}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {data && !error && overall && primaryType && (
        <>
          {/* Hero */}
          <div className="rounded-2xl border border-[#1e2a3a] bg-[#111827] p-6"
            style={{ borderLeftColor: overall.color, borderLeftWidth: 4 }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-[#64748b] uppercase tracking-widest mb-1">{data.location.country}</p>
                <h2 className="text-2xl font-black text-white">{data.location.name}</h2>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-sm font-bold px-3 py-1.5 rounded-lg"
                    style={{ color: overall.color, background: overall.color + "22" }}>
                    {overall.label}
                  </span>
                  <p className="text-sm text-[#64748b]">
                    {overall.score === 0
                      ? "No significant pollen detected"
                      : `${primaryType.label} pollen is the main concern`}
                  </p>
                </div>
              </div>
              <Flower2 className="w-10 h-10 flex-shrink-0 opacity-20 text-green-400" />
            </div>

            <div className="mt-4 space-y-1">
              <div className="h-2 rounded-full" style={{ background: "linear-gradient(to right, #10b981, #f59e0b, #f97316, #ef4444)" }} />
              <div className="flex justify-between text-[10px] text-[#64748b]">
                <span>Low</span><span>Moderate</span><span>High</span><span>Very High</span>
              </div>
            </div>
          </div>

          {/* Per-pollen type cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {TYPES.map(({ key, label, season }) => {
              const val = data.current[key];
              const r   = risk(val);
              const pct = val !== null ? Math.min((val / 200) * 100, 100) : 0;
              return (
                <div key={key} className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-4 space-y-3">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-semibold text-white">{label}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold flex-shrink-0"
                      style={{ color: r.color, background: r.color + "22" }}>
                      {r.label}
                    </span>
                  </div>
                  <p className="text-2xl font-black text-white">{val !== null ? Math.round(val) : "—"}</p>
                  <div className="space-y-1">
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: r.color }} />
                    </div>
                    <p className="text-[10px] text-[#64748b]">g/m³ · {season}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 7-day forecast */}
          {data.forecast.length > 0 && (
            <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-4">
              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-widest mb-3">7-Day Outlook</p>
              <div className="grid grid-cols-7 gap-1.5">
                {data.forecast.map(day => {
                  const r = overallRisk(day);
                  return (
                    <div key={day.date} className="flex flex-col items-center gap-2 p-2 rounded-lg bg-white/3 border border-[#1e2a3a]">
                      <p className="text-[10px] text-[#64748b] font-medium">{dayLabel(day.date)}</p>
                      <div className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: r.color, boxShadow: `0 0 6px ${r.color}` }} />
                      <p className="text-[9px] font-semibold text-center leading-tight"
                        style={{ color: r.color }}>{r.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <p className="text-xs text-[#64748b]">Data via Open-Meteo Air Quality API · Free, no key · Hourly updates</p>
    </div>
  );
}
