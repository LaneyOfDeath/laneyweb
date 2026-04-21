"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Flame } from "lucide-react";
import dynamic from "next/dynamic";
import LiveTimestamp from "@/components/LiveTimestamp";

const FireMapLeaflet = dynamic(() => import("./FireMapLeaflet"), { ssr: false });

interface FireEvent {
  id: string; title: string; date: string;
  lat: number; lon: number;
  magnitude: number | null; magnitudeUnit: string | null;
  sources: string[];
}

export default function FireDashboard() {
  const [events, setEvents] = useState<FireEvent[]>([]);
  const [count, setCount]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/fire");
      const json = await res.json();
      setEvents(json.events ?? []);
      setCount(json.count  ?? 0);
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="p-6 space-y-4 max-w-6xl">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-400/10 border border-orange-400/20">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-semibold text-orange-400">{count} active wildfires</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#64748b]">
          {lastUpdate && <LiveTimestamp date={lastUpdate} />}
          <button onClick={fetchData} className="p-2 bg-white/5 border border-[#1e2a3a] rounded-xl text-[#94a3b8] hover:text-white transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] overflow-hidden" style={{ height: 440 }}>
        {loading ? (
          <div className="flex items-center justify-center h-full text-[#64748b] text-sm">Loading fire data…</div>
        ) : (
          <FireMapLeaflet events={events} />
        )}
      </div>

      {/* List */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[#64748b] uppercase tracking-widest">Active Events</p>
        {events.slice(0, 30).map((e) => (
          <div key={e.id} className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-4 flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-orange-400/10 border border-orange-400/20 flex items-center justify-center flex-shrink-0">
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{e.title}</p>
              <p className="text-xs text-[#64748b] mt-0.5">
                {e.lat.toFixed(2)}°, {e.lon.toFixed(2)}°
                {e.magnitude ? ` · ${e.magnitude.toLocaleString()} ${e.magnitudeUnit ?? "acres"}` : ""}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-[#64748b]">{e.date ? new Date(e.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : ""}</p>
            </div>
          </div>
        ))}
        {!loading && events.length === 0 && (
          <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-6 text-center text-[#64748b] text-sm">
            No active wildfire events found
          </div>
        )}
      </div>

      <p className="text-xs text-[#64748b]">Data via NASA EONET · Open fire events from VIIRS/MODIS</p>
    </div>
  );
}
