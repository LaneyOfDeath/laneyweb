"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Zap, Wind, Leaf } from "lucide-react";
import LiveTimestamp from "@/components/LiveTimestamp";

interface PowerData {
  intensity: {
    from: string; to: string;
    actual: number | null; forecast: number; index: string;
  } | null;
  mix: { fuel: string; perc: number }[];
  history: { from: string; actual: number; index: string }[];
  regions: {
    id: number; name: string; forecast: number; index: string;
    mix: { fuel: string; perc: number }[];
  }[];
}

const FUEL_COLORS: Record<string, string> = {
  gas:     "#f59e0b",
  coal:    "#78716c",
  nuclear: "#8b5cf6",
  wind:    "#06b6d4",
  solar:   "#fbbf24",
  hydro:   "#3b82f6",
  biomass: "#84cc16",
  imports: "#94a3b8",
  other:   "#64748b",
};

const FUEL_LABELS: Record<string, string> = {
  gas: "Gas", coal: "Coal", nuclear: "Nuclear", wind: "Wind",
  solar: "Solar", hydro: "Hydro", biomass: "Biomass", imports: "Imports", other: "Other",
};

function indexColor(index: string) {
  switch (index) {
    case "very low":    return "#10b981";
    case "low":         return "#84cc16";
    case "moderate":    return "#f59e0b";
    case "high":        return "#f97316";
    case "very high":   return "#ef4444";
    default:            return "#94a3b8";
  }
}

function intensityLabel(index: string) {
  const map: Record<string, string> = {
    "very low":  "Very Low",
    "low":       "Low",
    "moderate":  "Moderate",
    "high":      "High",
    "very high": "Very High",
  };
  return map[index] ?? "Unknown";
}

// Mini sparkline using SVG
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 200, h = 40;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 40 }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function PowerDashboard() {
  const [data, setData] = useState<PowerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/power");
      const json = await res.json();
      setData(json);
      setLastUpdate(new Date());
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const mix = data?.mix ?? [];
  const sortedMix = [...mix].sort((a, b) => b.perc - a.perc);
  const renewables = mix.filter(m => ["wind", "solar", "hydro", "biomass"].includes(m.fuel))
    .reduce((sum, m) => sum + m.perc, 0);
  const fossil = mix.filter(m => ["gas", "coal"].includes(m.fuel))
    .reduce((sum, m) => sum + m.perc, 0);

  const historyValues = (data?.history ?? []).map(h => h.actual);
  const intensity = data?.intensity;

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold">UK National Grid</h2>
          <p className="text-xs text-[#64748b]">Live carbon intensity & generation mix</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && <LiveTimestamp date={lastUpdate} />}
          <button onClick={fetchData} className="p-2 bg-white/5 border border-[#1e2a3a] rounded-xl text-[#94a3b8] hover:text-white transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Hero stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            icon: Zap,
            label: "Carbon Intensity",
            value: intensity?.actual != null ? `${intensity.actual}` : (intensity?.forecast != null ? `~${intensity.forecast}` : "—"),
            unit: "gCO₂/kWh",
            color: intensity ? indexColor(intensity.index) : "#94a3b8",
            sub: intensity ? intensityLabel(intensity.index) : "",
          },
          {
            icon: Leaf,
            label: "Renewable",
            value: `${renewables.toFixed(1)}%`,
            unit: "of mix",
            color: "#10b981",
            sub: "Wind + Solar + Hydro + Bio",
          },
          {
            icon: Wind,
            label: "Fossil Fuels",
            value: `${fossil.toFixed(1)}%`,
            unit: "of mix",
            color: fossil < 30 ? "#10b981" : fossil < 50 ? "#f59e0b" : "#ef4444",
            sub: "Gas + Coal",
          },
          {
            icon: Zap,
            label: "Nuclear",
            value: `${(mix.find(m => m.fuel === "nuclear")?.perc ?? 0).toFixed(1)}%`,
            unit: "of mix",
            color: "#8b5cf6",
            sub: "Zero carbon",
          },
        ].map(({ icon: Icon, label, value, unit, color, sub }) => (
          <div key={label} className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" style={{ color }} />
              <p className="text-[10px] text-[#64748b] uppercase tracking-wider">{label}</p>
            </div>
            <p className="text-2xl font-black" style={{ color }}>{value}</p>
            <p className="text-[10px] text-[#64748b] mt-0.5">{unit}</p>
            {sub && <p className="text-[10px] text-[#64748b] mt-0.5 truncate">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Generation mix */}
      <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-4">
        <p className="text-xs font-semibold text-[#64748b] uppercase tracking-widest mb-4">
          Current Generation Mix
        </p>
        {loading && !mix.length ? (
          <p className="text-[#64748b] text-sm">Loading…</p>
        ) : (
          <div className="space-y-2.5">
            {sortedMix.filter(m => m.perc > 0).map(m => (
              <div key={m.fuel} className="flex items-center gap-3">
                <div className="w-16 text-xs text-right" style={{ color: FUEL_COLORS[m.fuel] ?? "#94a3b8" }}>
                  {FUEL_LABELS[m.fuel] ?? m.fuel}
                </div>
                <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${m.perc}%`,
                      background: FUEL_COLORS[m.fuel] ?? "#94a3b8",
                    }}
                  />
                </div>
                <div className="w-10 text-xs text-right text-white font-semibold">{m.perc.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 24h sparkline */}
      {historyValues.length > 1 && (
        <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-[#64748b] uppercase tracking-widest">
              Carbon Intensity — Last 24 Hours
            </p>
            {historyValues.length > 0 && (
              <span className="text-xs text-[#64748b]">
                {Math.min(...historyValues)}–{Math.max(...historyValues)} gCO₂/kWh
              </span>
            )}
          </div>
          <Sparkline data={historyValues} color={intensity ? indexColor(intensity.index) : "#06b6d4"} />
          <div className="flex justify-between text-[10px] text-[#64748b] mt-1">
            <span>24h ago</span>
            <span>Now</span>
          </div>
        </div>
      )}

      {/* Regional breakdown */}
      {data?.regions && data.regions.length > 0 && (
        <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-4">
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-widest mb-3">
            UK Regional Carbon Intensity
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {data.regions.map(r => (
              <div key={r.id} className="rounded-lg border border-[#1e2a3a] bg-[#0d1224] p-2.5 text-center">
                <p className="text-[11px] text-[#94a3b8] truncate mb-1">{r.name}</p>
                <p className="font-bold text-sm" style={{ color: indexColor(r.index) }}>{r.forecast}</p>
                <p className="text-[10px] text-[#64748b]">gCO₂/kWh</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-[#64748b]">Data via National Grid ESO Carbon Intensity API · UK only · Free, no key</p>
    </div>
  );
}
