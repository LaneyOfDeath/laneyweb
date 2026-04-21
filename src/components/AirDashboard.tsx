"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Search, Wind, X } from "lucide-react";
import CountUp from "@/components/CountUp";
import { clsx } from "clsx";

interface AirData {
  location: { name: string; country: string; lat: number; lon: number };
  euAqi: number | null; usAqi: number | null;
  label: string; color: string;
  pm25: number | null; pm10: number | null;
  co: number | null; no2: number | null; o3: number | null; so2: number | null;
  timestamp: number;
}

const CITIES = ["London","Paris","Beijing","New York","Delhi","Los Angeles","Tokyo","Berlin","Sydney","Dubai","Cairo","Mumbai"];

function GaugeMeter({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-[#64748b]">{label}</span>
        <span className="text-white font-semibold">{value !== null ? value.toFixed(1) : "—"} µg/m³</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function AirDashboard() {
  const [data, setData]     = useState<AirData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const [city, setCity]     = useState("London");
  const [search, setSearch] = useState("");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async (target: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/air?city=${encodeURIComponent(target)}`);
      if (!res.ok) throw new Error("Not found");
      setData(await res.json());
      setLastUpdate(new Date());
    } catch {
      setError(`Could not find air quality data for "${target}"`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(city); }, [fetchData]);

  const handleSearch = () => {
    if (!search.trim()) return;
    setCity(search.trim());
    fetchData(search.trim());
    setSearch("");
  };

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
        <button onClick={handleSearch} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-medium hover:bg-emerald-500/30 transition-colors">
          Search
        </button>
        <button onClick={() => fetchData(city)} className="p-2 bg-white/5 border border-[#1e2a3a] rounded-xl text-[#94a3b8] hover:text-white transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
        {lastUpdate && <span className="text-xs text-[#64748b]">Updated {lastUpdate.toLocaleTimeString()}</span>}
      </div>

      {/* City pills */}
      <div className="flex flex-wrap gap-1.5">
        {CITIES.map(c => (
          <button key={c} onClick={() => { setCity(c); fetchData(c); }}
            className={clsx("px-2.5 py-1 rounded-lg text-xs transition-colors border",
              city === c ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-white/5 text-[#64748b] border-[#1e2a3a] hover:text-white hover:bg-white/10"
            )}>
            {c}
          </button>
        ))}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {data && !error && (
        <>
          {/* Hero AQI card */}
          <div className="rounded-2xl border border-[#1e2a3a] bg-[#111827] p-6"
            style={{ borderLeftColor: data.color, borderLeftWidth: 4 }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-[#64748b] uppercase tracking-widest mb-1">{data.location.country}</p>
                <h2 className="text-2xl font-black text-white">{data.location.name}</h2>
                <div className="flex items-end gap-3 mt-3">
                  <span className="text-5xl font-black" style={{ color: data.color }}>
                    {data.euAqi ?? "—"}
                  </span>
                  <div className="mb-1">
                    <p className="font-bold text-sm" style={{ color: data.color }}>{data.label}</p>
                    <p className="text-xs text-[#64748b]">EU Air Quality Index</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <Wind className="w-4 h-4 text-[#64748b]" />
                  <span className="text-xs text-[#64748b]">US AQI</span>
                </div>
                <p className="text-2xl font-bold text-white">{data.usAqi != null ? <CountUp end={data.usAqi} /> : "—"}</p>
              </div>
            </div>

            {/* AQI bar */}
            <div className="mt-4 space-y-1">
              <div className="h-3 rounded-full overflow-hidden" style={{ background: "linear-gradient(to right, #10b981, #84cc16, #f59e0b, #f97316, #ef4444, #7f1d1d)" }}>
                <div className="h-full w-1 bg-white rounded-full shadow-lg transition-all" style={{ marginLeft: `${Math.min(((data.euAqi ?? 0) / 120) * 100, 98)}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-[#64748b]">
                <span>Good</span><span>Fair</span><span>Moderate</span><span>Poor</span><span>Very Poor</span><span>Hazardous</span>
              </div>
            </div>
          </div>

          {/* Pollutant grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-5 space-y-4">
              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-widest">Particulate Matter</p>
              {data.pm25 !== null && <GaugeMeter value={data.pm25} max={75} color="#f97316" label="PM2.5" />}
              {data.pm10 !== null && <GaugeMeter value={data.pm10} max={150} color="#f59e0b" label="PM10" />}
            </div>
            <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-5 space-y-4">
              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-widest">Gases</p>
              {data.no2 !== null && <GaugeMeter value={data.no2} max={200} color="#a78bfa" label="NO₂" />}
              {data.o3  !== null && <GaugeMeter value={data.o3}  max={180} color="#38bdf8" label="Ozone (O₃)" />}
              {data.so2 !== null && <GaugeMeter value={data.so2} max={350} color="#fb923c" label="SO₂" />}
              {data.co  !== null && <GaugeMeter value={data.co / 1000} max={10} color="#94a3b8" label="CO (mg/m³)" />}
            </div>
          </div>
        </>
      )}

      <p className="text-xs text-[#64748b]">Data via Open-Meteo Air Quality API · Free, no key · Updates every 15 min</p>
    </div>
  );
}
