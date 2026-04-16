"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Car, Info, RefreshCw, Search } from "lucide-react";

const MapComponent = dynamic(() => import("./TrafficMapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0d1224]">
      <div className="w-8 h-8 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
    </div>
  ),
});

interface Incident {
  type: string;
  geometry: { type: string; coordinates: number[] | number[][] };
  properties: {
    iconCategory: number;
    magnitudeOfDelay: number;
    events?: { description: string }[];
    from?: string;
    to?: string;
    delay?: number;
    roadNumbers?: string[];
  };
}

const CITIES = [
  { label: "London", lat: 51.5074, lon: -0.1278 },
  { label: "Paris", lat: 48.8566, lon: 2.3522 },
  { label: "New York", lat: 40.7128, lon: -74.006 },
  { label: "Los Angeles", lat: 34.0522, lon: -118.2437 },
  { label: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { label: "Sydney", lat: -33.8688, lon: 151.2093 },
];

const DELAY_COLORS = ["text-green-400", "text-yellow-400", "text-orange-400", "text-red-400", "text-red-600"];
const DELAY_LABELS = ["Free flow", "Minor delay", "Moderate delay", "Major delay", "Standstill"];

export default function TrafficMap() {
  const [city, setCity] = useState(CITIES[0]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [hasKey, setHasKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/traffic?lat=${city.lat}&lon=${city.lon}&radius=0.15`);
      if (!res.ok) return;
      const json = await res.json();
      setIncidents(json.incidents ?? []);
      setHasKey(json.hasKey);
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 120000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-[#1e2a3a]">
        <div className="flex gap-1.5 flex-wrap">
          {CITIES.map((c) => (
            <button
              key={c.label}
              onClick={() => setCity(c)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                city.label === c.label
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  : "bg-white/5 text-[#94a3b8] border border-[#1e2a3a] hover:bg-white/10"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3 text-xs text-[#64748b]">
          {lastUpdate && <span>Updated {lastUpdate.toLocaleTimeString()}</span>}
          <button onClick={fetchData} disabled={loading} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#94a3b8] hover:text-white transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {!hasKey && (
        <div className="mx-4 mt-3 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <Info className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-yellow-300">
            <span className="font-semibold">Live traffic requires a TomTom API key.</span>{" "}
            Get one free (2,500 req/day) at{" "}
            <code className="text-cyan-400">developer.tomtom.com</code>, then add{" "}
            <code className="text-cyan-400">TOMTOM_API_KEY=your_key</code> to{" "}
            <code className="text-cyan-400">.env.local</code>.
            The map below shows road network via OpenStreetMap.
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0 mt-3 mx-4 mb-4 gap-3">
        <div className="flex-1 rounded-xl overflow-hidden border border-[#1e2a3a]">
          <MapComponent center={[city.lat, city.lon]} incidents={incidents} hasKey={hasKey} />
        </div>

        {/* Incidents panel */}
        <div className="w-64 border border-[#1e2a3a] rounded-xl bg-[#111827] flex flex-col overflow-hidden">
          <div className="px-4 pt-3 pb-2 border-b border-[#1e2a3a]">
            <div className="flex items-center gap-2">
              <Car className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-xs font-semibold text-white">Incidents ({incidents.length})</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {incidents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <p className="text-xs text-[#64748b]">
                  {hasKey ? "No incidents in this area" : "Add TomTom API key to see incidents"}
                </p>
              </div>
            ) : (
              incidents.map((inc, i) => {
                const delay = inc.properties.magnitudeOfDelay ?? 0;
                const desc = inc.properties.events?.[0]?.description ?? "Incident";
                const road = inc.properties.roadNumbers?.join(", ") ?? "";
                return (
                  <div key={i} className="px-4 py-3 border-b border-[#1e2a3a]/50 hover:bg-white/5">
                    <div className="flex items-start gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${DELAY_COLORS[Math.min(delay, 4)].replace("text-", "bg-")}`} />
                      <div>
                        <p className="text-xs text-white leading-snug">{desc}</p>
                        {road && <p className="text-[10px] text-[#64748b] mt-0.5">{road}</p>}
                        <p className={`text-[10px] mt-0.5 ${DELAY_COLORS[Math.min(delay, 4)]}`}>
                          {DELAY_LABELS[Math.min(delay, 4)]}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
