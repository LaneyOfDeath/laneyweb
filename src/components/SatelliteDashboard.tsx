"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { RefreshCw } from "lucide-react";
import { clsx } from "clsx";
import LiveTimestamp from "@/components/LiveTimestamp";

const SatelliteMapLeaflet = dynamic(() => import("@/components/SatelliteMapLeaflet"), { ssr: false });

const GROUPS = [
  { key: "stations", label: "Space Stations", color: "#06b6d4", desc: "ISS, Tiangong & more" },
  { key: "starlink",  label: "Starlink",       color: "#a78bfa", desc: "SpaceX constellation" },
  { key: "gps",       label: "GPS",            color: "#10b981", desc: "Navigation satellites" },
];

interface SatData {
  group: string;
  label: string;
  color: string;
  count: number;
  satellites: { name: string; lat: number; lon: number; alt: number }[];
  timestamp: number;
}

export default function SatelliteDashboard() {
  const [group, setGroup]           = useState("stations");
  const [data, setData]             = useState<SatData | null>(null);
  const [loading, setLoading]       = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async (g: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/satellites?group=${g}`);
      if (res.ok) {
        setData(await res.json());
        setLastUpdate(new Date());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(group); }, [fetchData, group]);

  useEffect(() => {
    const id = setInterval(() => fetchData(group), 20000);
    return () => clearInterval(id);
  }, [fetchData, group]);

  const current = GROUPS.find(g => g.key === group) ?? GROUPS[0];

  return (
    <div className="flex flex-col h-full gap-3 p-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-[#1e2a3a] overflow-hidden">
          {GROUPS.map(g => (
            <button
              key={g.key}
              onClick={() => setGroup(g.key)}
              className={clsx(
                "px-4 py-2 text-sm font-medium transition-colors",
                group === g.key ? "bg-[#1a2640]" : "text-[#64748b] hover:text-white"
              )}
              style={group === g.key ? { color: g.color } : undefined}
            >
              {g.label}
            </button>
          ))}
        </div>

        {data && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111827] border border-[#1e2a3a]">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: current.color }} />
            <span className="text-sm font-semibold" style={{ color: current.color }}>
              {data.count} satellites
            </span>
            <span className="text-xs text-[#64748b]">· {current.desc}</span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-3">
          {lastUpdate && <LiveTimestamp date={lastUpdate} />}
          <button onClick={() => fetchData(group)} className="p-2 bg-white/5 border border-[#1e2a3a] rounded-xl text-[#94a3b8] hover:text-white transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 min-h-0 rounded-2xl overflow-hidden border border-[#1e2a3a]">
        {loading && !data && (
          <div className="h-full flex items-center justify-center bg-[#060611]">
            <RefreshCw className="w-6 h-6 text-[#64748b] animate-spin" />
          </div>
        )}
        {data && (
          <SatelliteMapLeaflet satellites={data.satellites} color={current.color} />
        )}
      </div>

      <p className="text-xs text-[#64748b]">TLE data via CelesTrak · Positions via SGP4 propagation · Auto-refreshes every 20s</p>
    </div>
  );
}
