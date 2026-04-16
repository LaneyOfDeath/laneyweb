"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, AlertTriangle, Droplets, MapPin } from "lucide-react";

interface FloodWarning {
  id: string;
  description: string;
  severity: string;
  severityLevel: number;
  message: string;
  county: string | null;
  riverOrSea: string | null;
  timeRaised: string;
  timeMessageChanged: string;
}

interface Station {
  id: string;
  label: string;
  river: string;
  town: string;
  lat: number;
  lon: number;
}

interface FloodData {
  warnings: FloodWarning[];
  stations: Station[];
  timestamp: number;
}

const SEVERITY_CONFIG: Record<number, { label: string; color: string; bg: string; border: string }> = {
  1: { label: "Severe Flood Warning", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
  2: { label: "Flood Warning", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  3: { label: "Flood Alert", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  4: { label: "No Longer in Force", color: "text-[#64748b]", bg: "bg-white/5", border: "border-[#1e2a3a]" },
};

export default function FloodDashboard() {
  const [data, setData] = useState<FloodData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [filter, setFilter] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/flood");
      const json = await res.json();
      setData(json);
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const warnings = data?.warnings ?? [];
  const filtered = filter !== null ? warnings.filter((w) => w.severityLevel === filter) : warnings;

  const counts = {
    1: warnings.filter((w) => w.severityLevel === 1).length,
    2: warnings.filter((w) => w.severityLevel === 2).length,
    3: warnings.filter((w) => w.severityLevel === 3).length,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-[#1e2a3a]">
        <div className="flex gap-1.5 flex-wrap">
          {([null, 1, 2, 3] as (number | null)[]).map((level) => {
            const cfg = level !== null ? SEVERITY_CONFIG[level] : null;
            const isActive = filter === level;
            const count = level !== null ? counts[level as 1 | 2 | 3] : warnings.length;
            return (
              <button key={String(level)} onClick={() => setFilter(level)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
                  isActive
                    ? (cfg ? `${cfg.bg} ${cfg.color} ${cfg.border}` : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30")
                    : "bg-white/5 text-[#94a3b8] border-[#1e2a3a] hover:bg-white/10"
                }`}>
                {level === null ? `All (${count})` : `${cfg!.label} (${count})`}
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-3 text-xs text-[#64748b]">
          {lastUpdate && <span>Updated {lastUpdate.toLocaleTimeString()}</span>}
          <button onClick={fetchData} disabled={loading}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#94a3b8] hover:text-white transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!data ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="w-6 h-6 text-[#64748b] animate-spin" />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto py-4 px-4">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {([1, 2, 3] as const).map((level) => {
                const cfg = SEVERITY_CONFIG[level];
                return (
                  <div key={level} className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4`}>
                    <p className={`text-2xl font-black ${cfg.color}`}>{counts[level]}</p>
                    <p className="text-[10px] text-[#94a3b8] mt-1 leading-tight">{cfg.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Warning list */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Droplets className="w-10 h-10 text-[#64748b] mb-3" />
                <p className="text-sm text-[#64748b]">No active warnings for this filter</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filtered.map((w) => {
                  const cfg = SEVERITY_CONFIG[w.severityLevel] ?? SEVERITY_CONFIG[4];
                  return (
                    <div key={w.id} className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4`}>
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`w-4 h-4 ${cfg.color} flex-shrink-0 mt-0.5`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-semibold uppercase tracking-wider ${cfg.color}`}>
                              {cfg.label}
                            </span>
                            {w.county && (
                              <span className="flex items-center gap-1 text-[10px] text-[#64748b]">
                                <MapPin className="w-2.5 h-2.5" />{w.county}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-white font-medium leading-snug">{w.description}</p>
                          {w.riverOrSea && <p className="text-xs text-[#64748b] mt-1">{w.riverOrSea}</p>}
                          {w.message && <p className="text-xs text-[#94a3b8] mt-2 leading-relaxed line-clamp-3">{w.message}</p>}
                          <p className="text-[10px] text-[#4a5568] mt-2">
                            Raised: {new Date(w.timeRaised).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-[10px] text-[#64748b] text-center mt-4 pb-2">
              Source: Environment Agency · gov.uk · No API key required · Refreshes every 5 minutes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
