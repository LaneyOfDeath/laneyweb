"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { RefreshCw, Users, MapPin, Tv } from "lucide-react";
import LiveTimestamp from "@/components/LiveTimestamp";

const MapComponent = dynamic(() => import("./ISSMapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0d1224]">
      <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
    </div>
  ),
});

interface ISSData {
  iss: { lat: number; lon: number; timestamp: number } | null;
  crew: { name: string; craft: string }[];
}

export default function ISSDashboard() {
  const [data, setData] = useState<ISSData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLive, setShowLive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/space");
      const json = await res.json();
      setData({ iss: json.iss, crew: json.crew });
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // ISS moves fast, refresh every 10s
    return () => clearInterval(interval);
  }, [fetchData]);

  const iss = data?.iss;

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2a3a]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLive(false)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
              !showLive ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" : "bg-white/5 text-[#94a3b8] border-[#1e2a3a] hover:bg-white/10"
            }`}
          >
            <MapPin className="w-3 h-3 inline mr-1" />Live Position
          </button>
          <button
            onClick={() => setShowLive(true)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
              showLive ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" : "bg-white/5 text-[#94a3b8] border-[#1e2a3a] hover:bg-white/10"
            }`}
          >
            <Tv className="w-3 h-3 inline mr-1" />NASA Live Feed
          </button>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && <LiveTimestamp date={lastUpdate} />}
          <button onClick={fetchData} disabled={loading}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#94a3b8] hover:text-white transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 mx-4 my-3 gap-3">
        {/* Map or Live Feed */}
        <div className="flex-1 rounded-xl overflow-hidden border border-[#1e2a3a]">
          {showLive ? (
            <iframe
              src="https://www.youtube.com/embed/xAieE-QtOeM?autoplay=1&mute=1"
              className="w-full h-full"
              allow="autoplay; fullscreen"
              title="NASA ISS Live Feed"
            />
          ) : iss ? (
            <MapComponent lat={iss.lat} lon={iss.lon} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#0d1224]">
              <RefreshCw className="w-6 h-6 text-[#64748b] animate-spin" />
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="w-44 border border-[#1e2a3a] rounded-xl bg-[#111827] flex flex-col overflow-hidden flex-shrink-0">
          {/* Position */}
          <div className="px-3 pt-2.5 pb-2 border-b border-[#1e2a3a]">
            <div className="flex items-center gap-1.5 mb-2">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span className="text-[11px] font-semibold text-white">Position</span>
            </div>
            {iss ? (
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[10px] text-[#64748b]">Lat</span>
                  <span className="text-[10px] text-white">{iss.lat.toFixed(2)}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-[#64748b]">Lon</span>
                  <span className="text-[10px] text-white">{iss.lon.toFixed(2)}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-[#64748b]">Alt</span>
                  <span className="text-[10px] text-white">~408 km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-[#64748b]">Speed</span>
                  <span className="text-[10px] text-white">7.66 km/s</span>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-[#64748b]">Loading…</p>
            )}
          </div>

          {/* Crew */}
          <div className="px-3 pt-2.5 pb-2">
            <div className="flex items-center gap-1.5 mb-2">
              <Users className="w-3 h-3 text-violet-400" />
              <span className="text-[11px] font-semibold text-white">ISS Crew ({data?.crew.length ?? 0})</span>
            </div>
            <div className="space-y-1.5">
              {(data?.crew ?? []).map((c) => (
                <div key={c.name} className="flex items-center gap-1.5">
                  <span className="text-[10px]">👨‍🚀</span>
                  <span className="text-[10px] text-[#94a3b8]">{c.name}</span>
                </div>
              ))}
              {!data?.crew.length && <p className="text-[10px] text-[#64748b]">Loading…</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
