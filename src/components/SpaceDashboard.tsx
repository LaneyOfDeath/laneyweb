"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Rocket, AlertTriangle, Sun, Wind, Radio, Telescope } from "lucide-react";
import LiveTimestamp from "@/components/LiveTimestamp";
import ApodDashboard from "@/components/ApodDashboard";

interface SolarData {
  kp: { time: string; value: number } | null;
  kpHistory: { time: string; value: number }[];
  solarWind: { time: string; density: number; speed: number; temperature: number } | null;
  alerts: { time: string; code: string; message: string }[];
}

interface SpaceData {
  solar: SolarData | null;
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
  if (s === "Go")               return "text-green-400 bg-green-400/10 border-green-400/30";
  if (s === "TBD" || s === "TBC") return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
  if (s === "Hold")             return "text-orange-400 bg-orange-400/10 border-orange-400/30";
  if (s === "Success")          return "text-cyan-400 bg-cyan-400/10 border-cyan-400/30";
  return "text-[#94a3b8] bg-white/5 border-[#1e2a3a]";
}

function fmtDist(km: number) {
  if (km > 1_000_000) return `${(km / 1_000_000).toFixed(2)}M km`;
  return `${Math.round(km / 1000)}k km`;
}

function kpInfo(kp: number): { label: string; color: string; gLevel: string } {
  if (kp < 2) return { label: "Quiet",         color: "#10b981", gLevel: ""   };
  if (kp < 4) return { label: "Unsettled",      color: "#84cc16", gLevel: ""   };
  if (kp < 5) return { label: "Active",         color: "#f59e0b", gLevel: ""   };
  if (kp < 6) return { label: "Minor Storm",    color: "#f97316", gLevel: "G1" };
  if (kp < 7) return { label: "Moderate Storm", color: "#ef4444", gLevel: "G2" };
  if (kp < 8) return { label: "Strong Storm",   color: "#dc2626", gLevel: "G3" };
  if (kp < 9) return { label: "Severe Storm",   color: "#b91c1c", gLevel: "G4" };
  return             { label: "Extreme Storm",  color: "#7f1d1d", gLevel: "G5" };
}

function KpBar({ history }: { history: { time: string; value: number }[] }) {
  return (
    <div className="flex items-end gap-0.5 h-16">
      {history.map((h, i) => {
        const { color } = kpInfo(h.value);
        const pct = Math.max((h.value / 9) * 100, 4);
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full"
            title={`${h.time}: Kp ${h.value.toFixed(1)}`}>
            <div className="w-full rounded-sm" style={{ height: `${pct}%`, background: color, opacity: 0.85 }} />
          </div>
        );
      })}
    </div>
  );
}

export default function SpaceDashboard() {
  const [data, setData] = useState<SpaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [tab, setTab] = useState<"launches" | "asteroids" | "solar" | "apod">("launches");

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

  useEffect(() => {
    const t = setInterval(async () => {
      const res = await fetch("/api/space");
      const json = await res.json();
      setData(json);
      setLastUpdate(new Date());
    }, 60000);
    return () => clearInterval(t);
  }, []);

  const tabs = [
    { id: "launches"  as const, label: "Launches",      icon: Rocket        },
    { id: "asteroids" as const, label: "Asteroids",     icon: AlertTriangle },
    { id: "solar"     as const, label: "Space Weather", icon: Sun           },
    { id: "apod"      as const, label: "APOD",          icon: Telescope     },
  ];

  return (
    <div className="p-6 space-y-4 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-wrap gap-2">
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
          {lastUpdate && <LiveTimestamp date={lastUpdate} />}
          <button onClick={fetchData} className="p-2 bg-white/5 border border-[#1e2a3a] rounded-xl text-[#94a3b8] hover:text-white transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

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
                <p className="text-xs text-[#64748b] mt-0.5">Diameter: {a.diameterMin.toFixed(3)} – {a.diameterMax.toFixed(3)} km</p>
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

      {/* APOD TAB */}
      {tab === "apod" && (
        <div className="-mx-6 -mb-6">
          <ApodDashboard />
        </div>
      )}

      {/* SOLAR WEATHER TAB */}
      {tab === "solar" && (
        <div className="space-y-4">
          {loading && <p className="text-sm text-[#64748b] p-4">Loading space weather…</p>}
          {!loading && !data?.solar && (
            <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-6 text-center text-[#64748b] text-sm">
              Space weather data unavailable
            </div>
          )}
          {data?.solar && (solar => {
            const { kp, kpHistory, solarWind, alerts } = solar;
            const info = kp ? kpInfo(kp.value) : null;
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-5">
                    <p className="text-xs font-semibold text-[#64748b] uppercase tracking-widest mb-3">Planetary Kp Index</p>
                    {kp && info ? (
                      <>
                        <div className="flex items-end gap-3 mb-1">
                          <span className="text-5xl font-black" style={{ color: info.color }}>{kp.value.toFixed(1)}</span>
                          {info.gLevel && (
                            <span className="mb-1 px-2 py-0.5 rounded-full text-xs font-bold border"
                              style={{ color: info.color, borderColor: info.color + "40", background: info.color + "15" }}>
                              {info.gLevel}
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-sm" style={{ color: info.color }}>{info.label}</p>
                        <p className="text-xs text-[#64748b] mt-0.5">{new Date(kp.time).toLocaleString("en-GB")}</p>
                        <div className="mt-4">
                          <p className="text-[10px] text-[#64748b] uppercase tracking-widest mb-2">24-hour history</p>
                          <KpBar history={kpHistory} />
                          <div className="flex justify-between text-[10px] text-[#64748b] mt-1">
                            <span>older</span><span>now</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-[#64748b] text-sm">Kp data unavailable</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Wind className="w-4 h-4 text-orange-400" />
                      <p className="text-xs font-semibold text-[#64748b] uppercase tracking-widest">Solar Wind</p>
                    </div>
                    {solarWind ? (
                      <div className="space-y-2">
                        {[
                          { label: "Speed",       value: `${Math.round(solarWind.speed).toLocaleString()} km/s` },
                          { label: "Density",     value: `${solarWind.density.toFixed(2)} p/cm³` },
                          { label: "Temperature", value: `${solarWind.temperature.toLocaleString()} K` },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex justify-between items-center py-2 border-b border-[#1e2a3a]/60">
                            <span className="text-xs text-[#64748b]">{label}</span>
                            <span className="text-white font-bold font-mono text-sm">{value}</span>
                          </div>
                        ))}
                        <p className="text-[10px] text-[#64748b] pt-1">{new Date(solarWind.time).toLocaleString("en-GB")} UTC</p>
                      </div>
                    ) : (
                      <p className="text-[#64748b] text-sm">Solar wind data unavailable</p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Radio className="w-4 h-4 text-yellow-400" />
                    <p className="text-xs font-semibold text-[#64748b] uppercase tracking-widest">NOAA Space Weather Alerts</p>
                  </div>
                  {alerts.length > 0 ? (
                    <div className="space-y-3">
                      {alerts.map((a, i) => (
                        <div key={i} className="border-l-2 border-yellow-400/40 pl-3 py-0.5">
                          <div className="flex items-center gap-2 mb-1">
                            {a.code && <span className="text-[11px] font-semibold text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">{a.code}</span>}
                            {a.time && <span className="text-[11px] text-[#64748b]">{new Date(a.time).toLocaleString("en-GB")}</span>}
                          </div>
                          <p className="text-xs text-[#94a3b8] leading-relaxed whitespace-pre-wrap line-clamp-6">{a.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#64748b]">No active alerts</p>
                  )}
                </div>

                <p className="text-xs text-[#64748b]">Data via NOAA Space Weather Prediction Center · Updates every 5 min</p>
              </div>
            );
          })(data.solar)}
        </div>
      )}
    </div>
  );
}
