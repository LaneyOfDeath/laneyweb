"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, AlertTriangle, Flame, Mountain } from "lucide-react";
import CountUp from "@/components/CountUp";
import dynamic from "next/dynamic";
import LiveTimestamp from "@/components/LiveTimestamp";

const EarthMapLeaflet = dynamic(() => import("./EarthMapLeaflet"), { ssr: false });

interface Earthquake {
  id: string; mag: number; place: string; time: number;
  lat: number; lon: number; depth: number; type: string; url: string;
}
interface Volcano { name: string; country: string; lat: number; lon: number; status: string; }
interface EarthData {
  earthquakes: Earthquake[];
  wildfires: { lat: number; lon: number; brightness: number; confidence: number; date: string }[];
  volcanoes: Volcano[];
}

function magColor(mag: number) {
  if (mag < 3) return "text-green-400";
  if (mag < 4) return "text-yellow-400";
  if (mag < 5) return "text-orange-400";
  if (mag < 6) return "text-red-400";
  return "text-red-300 font-black";
}

function magBg(mag: number) {
  if (mag < 3) return "bg-green-400/10 border-green-400/20";
  if (mag < 4) return "bg-yellow-400/10 border-yellow-400/20";
  if (mag < 5) return "bg-orange-400/10 border-orange-400/20";
  return "bg-red-400/10 border-red-400/20";
}

export default function EarthDashboard() {
  const [data, setData] = useState<EarthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"quakes" | "volcanoes">("quakes");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/earth");
      const json = await res.json();
      setData(json);
      setLastUpdate(new Date());
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const quakes = data?.earthquakes ?? [];
  const volcanoes = data?.volcanoes ?? [];
  const major = quakes.filter(q => q.mag >= 5);

  return (
    <div className="p-6 space-y-4 max-w-6xl">
      {/* Tabs + refresh */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          {[
            { id: "quakes" as const, label: "Earthquakes", icon: AlertTriangle },
            { id: "volcanoes" as const, label: "Volcanoes", icon: Mountain },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                tab === id
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  : "bg-white/5 text-[#94a3b8] border-[#1e2a3a] hover:text-white hover:bg-white/10"
              }`}>
              <Icon className="w-4 h-4" />
              {label}
              {id === "quakes" && quakes.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {quakes.length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && <LiveTimestamp date={lastUpdate} />}
          <button onClick={fetchData} className="p-2 bg-white/5 border border-[#1e2a3a] rounded-xl text-[#94a3b8] hover:text-white transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Summary strip */}
      {tab === "quakes" && !loading && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Last 24h (M2.5+)", value: quakes.length, color: "text-white" },
            { label: "Significant (M5+)", value: major.length, color: major.length > 0 ? "text-red-400" : "text-green-400" },
            { label: "Deepest", value: quakes.length ? `${Math.max(...quakes.map(q => q.depth)).toFixed(0)} km` : "—", color: "text-[#94a3b8]" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-3 text-center">
              <p className={`text-xl font-black ${color}`}>{typeof value === "number" ? <CountUp end={value} /> : value}</p>
              <p className="text-[10px] text-[#64748b] mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Map */}
      <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] overflow-hidden" style={{ height: 380 }}>
        {data ? (
          <EarthMapLeaflet
            earthquakes={tab === "quakes" ? quakes : []}
            volcanoes={tab === "volcanoes" ? volcanoes : []}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-[#64748b] text-sm">
            {loading ? "Loading data…" : "No data available"}
          </div>
        )}
      </div>

      {/* List */}
      {tab === "quakes" && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-widest mb-2">
            Recent events (sorted by magnitude)
          </p>
          {[...quakes].sort((a, b) => b.mag - a.mag).slice(0, 20).map(q => (
            <div key={q.id} className={`flex items-center gap-3 rounded-xl border bg-[#111827] px-4 py-2.5 ${magBg(q.mag)}`}>
              <div className={`text-lg font-black w-12 flex-shrink-0 ${magColor(q.mag)}`}>
                M{q.mag.toFixed(1)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{q.place}</p>
                <p className="text-[11px] text-[#64748b]">
                  Depth {q.depth.toFixed(1)} km · {new Date(q.time).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <a href={q.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-cyan-400 hover:underline flex-shrink-0">USGS</a>
            </div>
          ))}
          <p className="text-xs text-[#64748b] pt-2">Data via USGS Earthquake Hazards Program · M2.5+ last 24 hours</p>
        </div>
      )}

      {tab === "volcanoes" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {volcanoes.map((v, i) => (
            <div key={i} className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{v.name}</p>
                <p className="text-xs text-[#64748b]">{v.country}</p>
              </div>
              <span className={`ml-auto px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                v.status === "Erupting"
                  ? "text-red-400 bg-red-400/10 border-red-400/30"
                  : "text-orange-400 bg-orange-400/10 border-orange-400/30"
              }`}>{v.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
