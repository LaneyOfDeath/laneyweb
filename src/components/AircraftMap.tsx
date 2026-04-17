"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { PlaneTakeoff, RefreshCw, AlertCircle } from "lucide-react";

// Dynamically import map to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("./AircraftMapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0d1224]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        <p className="text-sm text-[#64748b]">Loading map…</p>
      </div>
    </div>
  ),
});

interface Flight {
  icao24: string;
  callsign: string;
  country: string;
  longitude: number;
  latitude: number;
  altitude: number | null;
  onGround: boolean;
  velocity: number | null;
  heading: number | null;
  squawk: string | null;
}

interface AircraftData {
  total: number;
  shown: number;
  time: number;
  flights: Flight[];
}

interface BBox {
  laMin: number; laMax: number; loMin: number; loMax: number;
  label: string;
}

const REGION_GROUPS = [
  {
    group: "Americas",
    regions: [
      { label: "North America", laMin: 24, laMax: 60, loMin: -130, loMax: -60 },
      { label: "East Coast USA", laMin: 35, laMax: 47, loMin: -82, loMax: -68 },
      { label: "West Coast USA", laMin: 32, laMax: 50, loMin: -125, loMax: -110 },
      { label: "South America", laMin: -56, laMax: 13, loMin: -82, loMax: -34 },
    ],
  },
  {
    group: "Europe",
    regions: [
      { label: "All Europe", laMin: 35, laMax: 71, loMin: -10, loMax: 40 },
      { label: "UK & Ireland", laMin: 49, laMax: 61, loMin: -11, loMax: 2 },
      { label: "W. Europe", laMin: 43, laMax: 56, loMin: -5, loMax: 18 },
    ],
  },
  {
    group: "Africa / M. East",
    regions: [
      { label: "Middle East", laMin: 12, laMax: 42, loMin: 25, loMax: 65 },
      { label: "Africa", laMin: -35, laMax: 37, loMin: -18, loMax: 52 },
    ],
  },
  {
    group: "Asia",
    regions: [
      { label: "South Asia", laMin: 6, laMax: 38, loMin: 60, loMax: 100 },
      { label: "SE Asia", laMin: -10, laMax: 28, loMin: 95, loMax: 142 },
      { label: "East Asia", laMin: 20, laMax: 50, loMin: 100, loMax: 148 },
      { label: "Japan/Korea", laMin: 30, laMax: 46, loMin: 125, loMax: 148 },
    ],
  },
  {
    group: "Pacific",
    regions: [
      { label: "Australia", laMin: -44, laMax: -10, loMin: 112, loMax: 155 },
      { label: "Pacific NW", laMin: 35, laMax: 60, loMin: 130, loMax: 180 },
    ],
  },
];

const REGIONS: BBox[] = REGION_GROUPS.flatMap((g) => g.regions);

export default function AircraftMap() {
  const [data, setData] = useState<AircraftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState(REGIONS[0]);
  const [selected, setSelected] = useState<Flight | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams({
        laMin: region.laMin.toString(),
        laMax: region.laMax.toString(),
        loMin: region.loMin.toString(),
        loMax: region.loMax.toString(),
      });
      const res = await fetch(`/api/aircraft?${params}`);
      if (!res.ok) throw new Error("API error");
      const json: AircraftData = await res.json();
      setData(json);
      setLastUpdate(new Date());
    } catch {
      setError("Could not reach aircraft API. Retrying…");
    } finally {
      setLoading(false);
    }
  }, [region]);

  useEffect(() => {
    setLoading(true);
    setData(null);
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="flex flex-col h-full">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-[#1e2a3a]">
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {REGION_GROUPS.map((g) => (
            <div key={g.group} className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#4a6080] uppercase tracking-wider font-semibold w-max">{g.group}</span>
              {g.regions.map((r) => (
                <button
                  key={r.label}
                  onClick={() => setRegion(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    region.label === r.label
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "bg-white/5 text-[#94a3b8] border border-[#1e2a3a] hover:bg-white/10"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3 text-xs text-[#64748b]">
          {data && (
            <span>
              <span className="text-white font-semibold">{data.shown}</span> aircraft shown
              {data.total > data.shown && ` (${data.total} in area)`}
            </span>
          )}
          {lastUpdate && (
            <span>Updated {lastUpdate.toLocaleTimeString()}</span>
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

      {/* Map + detail panel */}
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 relative">
          {error && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </div>
          )}
          <MapComponent
            flights={data?.flights ?? []}
            region={region}
            onSelectFlight={setSelected}
            selectedFlight={selected}
          />
        </div>

        {/* Side panel */}
        <div className="w-64 border-l border-[#1e2a3a] flex flex-col overflow-hidden">
          {selected ? (
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-white text-sm">{selected.callsign}</p>
                  <p className="text-xs text-[#64748b]">{selected.country}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-[#64748b] hover:text-white text-lg leading-none">×</button>
              </div>
              <div className="space-y-2">
                {[
                  { label: "ICAO24", value: selected.icao24 },
                  { label: "Altitude", value: selected.altitude ? `${selected.altitude.toLocaleString()} ft` : "N/A" },
                  { label: "Speed", value: selected.velocity ? `${selected.velocity} kts` : "N/A" },
                  { label: "Heading", value: selected.heading ? `${selected.heading}°` : "N/A" },
                  { label: "Squawk", value: selected.squawk ?? "N/A" },
                  { label: "Status", value: selected.onGround ? "On ground" : "Airborne" },
                  { label: "Position", value: `${selected.latitude.toFixed(4)}, ${selected.longitude.toFixed(4)}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-[#64748b]">{label}</span>
                    <span className="text-white font-mono">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <p className="px-4 pt-3 pb-2 text-[10px] text-[#64748b] uppercase tracking-wider font-semibold">
                Aircraft ({data?.flights.length ?? 0})
              </p>
              {(data?.flights ?? []).slice(0, 50).map((f) => (
                <button
                  key={f.icao24}
                  onClick={() => setSelected(f)}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/5 transition-colors text-left"
                >
                  <PlaneTakeoff className={`w-3 h-3 flex-shrink-0 ${f.onGround ? "text-[#64748b]" : "text-sky-400"}`} />
                  <div className="min-w-0">
                    <p className="text-xs text-white font-medium truncate">{f.callsign || f.icao24}</p>
                    <p className="text-[10px] text-[#64748b] truncate">{f.country}</p>
                  </div>
                  {f.altitude && (
                    <span className="ml-auto text-[10px] text-[#64748b] tabular-nums">{Math.round(f.altitude / 100) * 100}ft</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
