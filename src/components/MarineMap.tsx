"use client";

import { useState } from "react";
import { Anchor, Info } from "lucide-react";

const PORTS = [
  { label: "English Channel", lat: 50.5,  lon: 1.0,   zoom: 9  },
  { label: "Singapore Strait", lat: 1.2,  lon: 104.0, zoom: 10 },
  { label: "Strait of Hormuz", lat: 26.5, lon: 56.5,  zoom: 9  },
  { label: "Suez Canal",       lat: 30.5, lon: 32.3,  zoom: 10 },
  { label: "Thames Estuary",   lat: 51.5, lon: 1.0,   zoom: 10 },
  { label: "Rotterdam",        lat: 51.9, lon: 4.5,   zoom: 11 },
  { label: "Dover Strait",     lat: 51.0, lon: 1.4,   zoom: 11 },
  { label: "North Sea",        lat: 55.0, lon: 4.0,   zoom: 7  },
];

export default function MarineMap() {
  const [port, setPort] = useState(PORTS[0]);

  const embedUrl = `https://www.marinetraffic.com/en/ais/embed/zoom:${port.zoom}/centery:${port.lat}/centerx:${port.lon}/maptype:1/shownames:true/mmsi:0/shipid:0/fleet:/fleet_id:/vtypes:/showmenu:false/remember:false`;

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-[#1e2a3a]">
        <div className="flex gap-1.5 flex-wrap">
          {PORTS.map((p) => (
            <button
              key={p.label}
              onClick={() => setPort(p)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                port.label === p.label
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-white/5 text-[#94a3b8] border border-[#1e2a3a] hover:bg-white/10"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-[#64748b]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
          </span>
          <span className="text-green-400 font-medium">Live AIS</span>
          <span>· via MarineTraffic</span>
        </div>
      </div>

      {/* Info banner */}
      <div className="mx-4 mt-3 flex items-start gap-2.5 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-300">
          Live vessel positions from MarineTraffic · Click any vessel for details · Use mouse to pan & zoom
        </p>
      </div>

      {/* Embedded map */}
      <div className="flex-1 mx-4 my-3 rounded-xl overflow-hidden border border-[#1e2a3a]">
        <iframe
          key={`${port.lat}-${port.lon}-${port.zoom}`}
          src={embedUrl}
          style={{ width: "100%", height: "100%", border: "none", background: "#0d1224" }}
          allowFullScreen
          title={`Marine traffic — ${port.label}`}
          loading="lazy"
        />
      </div>
    </div>
  );
}
