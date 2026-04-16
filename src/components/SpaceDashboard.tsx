"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Rocket, Users, AlertTriangle, Globe2 } from "lucide-react";
import dynamic from "next/dynamic";

const SpaceMapLeaflet = dynamic(() => import("./SpaceMapLeaflet"), { ssr: false });

interface SpaceData {
  iss: { lat: number; lon: number; timestamp: number } | null;
  crew: { name: string; craft: string }[];
  launches: {
    id: string; name: string; net: string; status: string;
    rocket: string; provider: string; pad: string; location: string;
    missionName: string; missionType: string;
  }[];
  asteroids: {
    name: string; diameterMin: number; diameterMax: number;
    hazardous: boolean; approachTime: string; velocity: number; missDistance: number;
  }[];
}

function statusColor(s: string) {
  if (s === "Go") return "text-green-400 bg-green-400/10 border-green-400/30";
  if (s === "TBD" || s === "TBC") return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
  if (s === "Hold") return "text-orange-400 bg-orange-400/10 border-orange-400/30";
  if (s === "Success") return "text-cyan-400 bg-cyan-400/10 border-cyan-400/30";
  return "text-[#94a3b8] bg-white/5 border-[#1e2a3a]";
}

function fmtDist(km: number) {
  if (km > 1_000_000) return `${(km / 1_000_000).toFixed(2)}M km`;
  return `${Math.round(km / 1000)}k km`;
}

export default function SpaceDashboard() {
  const [data, setData] = useState<SpaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [tab, setTab] = useState<"iss" | "launches" | "asteroids">("iss");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/space");
      const json = await res.json();
      setData(json);
      setLastUpdate(new Date());
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ISS auto-refresh every 10s
  useEffect(() => {
    const t = setInterval(async () => {
      const res = await fetch("/api/space");
      const json = await res.json();
      setData(json);
      setLastUpdate(new Date());
    }, 10000);
    return () => clearInterval(t);
  }, []);

  const tabs = [
    { id: "iss" as const, label: "ISS Live", icon: Globe2 },
    { id: "launches" as const, label: "Launches", icon: Rocket },
    { id: "asteroids" as const, label: "Asteroids", icon: AlertTriangle },
  ];

  return (
    <div className="p-6 space-y-4 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                tab === id
                  ? "bg-violet-500/20 text-violet-300 border-violet-500/30"
                  : "bg-white/5 text-[#94a3b8] border-[#1e2a3a] hover:text-white hover:bg-white/10"
              }`}>
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && <span className="text-xs text-[#64748b]">Updated {lastUpdate.toLocaleTimeString()}</span>}
          <button onClick={fetchData} className="p-2 bg-white/5 border border-[#1e2a3a] rounded-xl text-[#94a3b8] hover:text-white transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ISS TAB */}
      {tab === "iss" && (
        <div className="space-y-4">
          {/* Map */}
          <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] overflow-hidden" style={{ height: 400 }}>
            {data?.iss ? (
              <SpaceMapLeaflet lat={data.iss.lat} lon={data.iss.lon} />
            ) : (
              <div className="flex items-center justify-center h-full text-[#64748b] text-sm">
                {loading ? "Loading ISS position…" : "ISS position unavailable"}
              </div>
            )}
          </div>

          {/* Coords + crew */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data?.iss && (
              <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-4 space-y-2">
                <p className="text-xs font-semibold text-[#64748b] uppercase tracking-widest">ISS Position</p>
                <div className="flex gap-6 mt-2">
                  <div>
                    <p className="text-[10px] text-[#64748b]">Latitude</p>
                    <p className="text-white font-bold font-mono">{data.iss.lat.toFixed(4)}°</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#64748b]">Longitude</p>
                    <p className="text-white font-bold font-mono">{data.iss.lon.toFixed(4)}°</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#64748b]">Altitude</p>
                    <p className="text-white font-bold font-mono">~408 km</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#64748b]">Speed</p>
                    <p className="text-white font-bold font-mono">27,600 km/h</p>
                  </div>
                </div>
              </div>
            )}
            <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-violet-400" />
                <p className="text-xs font-semibold text-[#64748b] uppercase tracking-widest">Crew aboard ISS</p>
                <span className="ml-auto text-xs text-violet-400 font-bold">{data?.crew.length ?? 0} astronauts</span>
              </div>
              <div className="space-y-1.5">
                {(data?.crew ?? []).map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs text-violet-300 font-bold">{i + 1}</div>
                    <span className="text-sm text-white">{c.name}</span>
                  </div>
                ))}
                {(!data?.crew.length) && <p className="text-xs text-[#64748b]">Loading crew data…</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LAUNCHES TAB */}
      {tab === "launches" && (
        <div className="space-y-2">
          {loading && <p className="text-sm text-[#64748b] p-4">Loading launch schedule…</p>}
          {(data?.launches ?? []).map((l, i) => {
            const net = new Date(l.net);
            const isUpcoming = net > new Date();
            return (
              <div key={i} className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-4 flex flex-wrap gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <Rocket className="w-5 h-5 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-white font-semibold text-sm truncate">{l.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusColor(l.status)}`}>{l.status}</span>
                  </div>
                  <p className="text-xs text-[#64748b]">{l.rocket} · {l.provider}</p>
                  <p className="text-xs text-[#64748b] mt-0.5">{l.location}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-white">{net.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
                  <p className="text-xs text-[#64748b]">{net.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} UTC</p>
                  {isUpcoming && (
                    <p className="text-[11px] text-violet-400 mt-0.5">T-{Math.floor((net.getTime() - Date.now()) / 86400000)}d</p>
                  )}
                </div>
              </div>
            );
          })}
          {!loading && !data?.launches.length && (
            <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-6 text-center text-[#64748b] text-sm">
              Launch schedule temporarily unavailable (rate limited) — try again in a few minutes
            </div>
          )}
          <p className="text-xs text-[#64748b] pt-2">Data via The Space Devs · Free API</p>
        </div>
      )}

      {/* ASTEROIDS TAB */}
      {tab === "asteroids" && (
        <div className="space-y-2">
          {loading && <p className="text-sm text-[#64748b] p-4">Loading asteroid data…</p>}
          {(data?.asteroids ?? []).map((a, i) => (
            <div key={i} className={`rounded-xl border bg-[#111827] p-4 flex flex-wrap gap-4 items-center ${a.hazardous ? "border-red-500/30" : "border-[#1e2a3a]"}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${a.hazardous ? "bg-red-500/10 border border-red-500/20" : "bg-amber-500/10 border border-amber-500/20"}`}>
                <AlertTriangle className={`w-5 h-5 ${a.hazardous ? "text-red-400" : "text-amber-400"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-sm">{a.name.replace("(", "").replace(")", "")}</p>
                  {a.hazardous && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-red-400 bg-red-400/10 border border-red-400/30">Potentially Hazardous</span>
                  )}
                </div>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Diameter: {a.diameterMin.toFixed(3)} – {a.diameterMax.toFixed(3)} km
                </p>
              </div>
              <div className="text-right flex-shrink-0 space-y-0.5">
                <p className="text-sm font-bold text-white">{fmtDist(a.missDistance)}</p>
                <p className="text-[11px] text-[#64748b]">miss distance</p>
                <p className="text-[11px] text-[#64748b]">{Math.round(a.velocity / 1000).toLocaleString()} km/s</p>
              </div>
            </div>
          ))}
          {!loading && !data?.asteroids.length && (
            <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-6 text-center text-[#64748b] text-sm">
              Asteroid data unavailable — NASA DEMO_KEY may be rate limited
            </div>
          )}
          <p className="text-xs text-[#64748b] pt-2">Data via NASA NeoWs · Today&apos;s close approaches</p>
        </div>
      )}
    </div>
  );
}
