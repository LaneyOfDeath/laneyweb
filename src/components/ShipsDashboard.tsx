"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { Ship, Wifi, WifiOff, RefreshCw } from "lucide-react";
import type { Vessel } from "./ShipsMapLeaflet";

const MapComponent = dynamic(() => import("./ShipsMapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0d1224]">
      <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
    </div>
  ),
});

const AREAS = [
  { label: "English Channel", center: [50.5, 1.0] as [number, number], zoom: 9,  bbox: [[49.0, -2.0], [52.0, 4.0]] },
  { label: "Thames Estuary",  center: [51.5, 1.0] as [number, number], zoom: 10, bbox: [[51.0, 0.0],  [52.0, 2.0]] },
  { label: "Dover Strait",    center: [51.0, 1.4] as [number, number], zoom: 11, bbox: [[50.5, 0.8],  [51.5, 2.0]] },
  { label: "North Sea",       center: [55.0, 4.0] as [number, number], zoom: 7,  bbox: [[51.0, -2.0], [58.0, 10.0]] },
  { label: "Rotterdam",       center: [51.9, 4.5] as [number, number], zoom: 11, bbox: [[51.5, 3.8],  [52.3, 5.2]] },
  { label: "Singapore",       center: [1.2, 104.0] as [number, number], zoom: 10, bbox: [[1.0, 103.5], [1.6, 104.8]] },
];

const SHIP_TYPE_LABELS: Record<number, string> = {
  30: "Fishing", 31: "Towing", 36: "Sailing", 37: "Pleasure",
  60: "Passenger", 70: "Cargo", 80: "Tanker",
};

function getTypeLabel(type: number): string {
  return SHIP_TYPE_LABELS[type] ?? SHIP_TYPE_LABELS[Math.floor(type / 10) * 10] ?? "Other";
}

export default function ShipsDashboard() {
  const [area, setArea] = useState(AREAS[0]);
  const [vessels, setVessels] = useState<Map<string, Vessel>>(new Map());
  const [status, setStatus] = useState<"connecting" | "live" | "disconnected" | "nokey">("connecting");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback((selectedArea: typeof AREAS[0]) => {
    const key = process.env.NEXT_PUBLIC_AISSTREAM_API_KEY;
    if (!key) { setStatus("nokey"); return; }

    if (wsRef.current) wsRef.current.close();
    setStatus("connecting");
    setVessels(new Map());

    const ws = new WebSocket("wss://stream.aisstream.io/v0/stream");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        APIKey: key,
        BoundingBoxes: [selectedArea.bbox],
        FilterMessageTypes: ["PositionReport"],
      }));
      setStatus("live");
    };

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        const pos = msg.Message?.PositionReport;
        const meta = msg.MetaData;
        if (!pos || !meta) return;
        const vessel: Vessel = {
          mmsi: String(meta.MMSI),
          name: meta.ShipName?.trim() || "Unknown",
          lat: pos.Latitude,
          lon: pos.Longitude,
          speed: pos.Sog ?? 0,
          course: pos.Cog ?? 0,
          shipType: meta.ShipType ?? 0,
          timestamp: Date.now(),
        };
        setVessels((prev) => new Map(prev).set(vessel.mmsi, vessel));
      } catch { /* ignore malformed */ }
    };

    ws.onerror = () => setStatus("disconnected");
    ws.onclose = () => {
      setStatus("disconnected");
      reconnectRef.current = setTimeout(() => connect(selectedArea), 5000);
    };
  }, []);

  useEffect(() => {
    connect(area);
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [area, connect]);

  const vesselList = Array.from(vessels.values()).sort((a, b) => b.speed - a.speed).slice(0, 50);

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-[#1e2a3a]">
        <div className="flex gap-1.5 flex-wrap">
          {AREAS.map((a) => (
            <button key={a.label} onClick={() => setArea(a)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                area.label === a.label
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-white/5 text-[#94a3b8] border border-[#1e2a3a] hover:bg-white/10"
              }`}>
              {a.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs">
          {status === "live" && <><Wifi className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400 font-medium">Live</span></>}
          {status === "connecting" && <><RefreshCw className="w-3.5 h-3.5 text-yellow-400 animate-spin" /><span className="text-yellow-400">Connecting…</span></>}
          {status === "disconnected" && <><WifiOff className="w-3.5 h-3.5 text-red-400" /><span className="text-red-400">Reconnecting…</span></>}
          {status === "nokey" && <span className="text-yellow-400">Add NEXT_PUBLIC_AISSTREAM_API_KEY</span>}
          <span className="text-[#64748b]">· {vessels.size} vessels</span>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 mt-3 mx-4 mb-4 gap-3">
        {/* Map */}
        <div className="flex-1 rounded-xl overflow-hidden border border-[#1e2a3a]">
          <MapComponent center={area.center} zoom={area.zoom} vessels={vesselList} />
        </div>

        {/* Vessel list */}
        <div className="w-44 border border-[#1e2a3a] rounded-xl bg-[#111827] flex flex-col overflow-hidden flex-shrink-0">
          <div className="px-3 pt-2.5 pb-2 border-b border-[#1e2a3a]">
            <div className="flex items-center gap-1.5">
              <Ship className="w-3 h-3 text-blue-400" />
              <span className="text-[11px] font-semibold text-white">Vessels ({vessels.size})</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {vesselList.length === 0 ? (
              <div className="flex items-center justify-center py-8 px-3 text-center">
                <p className="text-[10px] text-[#64748b]">
                  {status === "nokey" ? "API key required" : "Waiting for data…"}
                </p>
              </div>
            ) : vesselList.map((v) => (
              <div key={v.mmsi} className="px-3 py-2 border-b border-[#1e2a3a]/50 hover:bg-white/5">
                <p className="text-[10px] text-white font-medium truncate">{v.name}</p>
                <p className="text-[9px] text-[#64748b] mt-0.5">{getTypeLabel(v.shipType)}</p>
                <p className="text-[9px] text-cyan-400 mt-0.5">{v.speed.toFixed(1)} kn</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
