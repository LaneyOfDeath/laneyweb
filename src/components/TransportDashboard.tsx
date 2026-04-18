"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Train } from "lucide-react";

interface LineStatus {
  severity: number;
  description: string;
  reason: string | null;
}

interface Line {
  id: string;
  name: string;
  mode: string;
  statuses: LineStatus[];
}

const LINE_COLORS: Record<string, string> = {
  bakerloo:       "#894e24",
  central:        "#dc241f",
  circle:         "#ffd329",
  district:       "#007d32",
  "hammersmith-city": "#f4a9be",
  jubilee:        "#a1a5a7",
  metropolitan:   "#751056",
  northern:       "#000000",
  piccadilly:     "#0019a8",
  victoria:       "#0098d4",
  "waterloo-city": "#93ceba",
  overground:     "#ef7b10",
  "elizabeth-line": "#7156a5",
  dlr:            "#00afad",
  tram:           "#84b817",
};

function severityColor(s: number): { dot: string; text: string; bg: string; border: string } {
  if (s === 10) return { dot: "bg-green-400",  text: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/20"  };
  if (s >= 7)   return { dot: "bg-yellow-400", text: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" };
  if (s >= 4)   return { dot: "bg-orange-400", text: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20" };
  return              { dot: "bg-red-400",    text: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/20"    };
}

const MODE_ORDER = ["tube", "elizabeth-line", "overground", "dlr", "tram"];

export default function TransportDashboard() {
  const [lines, setLines]   = useState<Line[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/transport");
      const json = await res.json();
      setLines(json.lines ?? []);
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const sorted = [...lines].sort((a, b) => {
    const ai = MODE_ORDER.indexOf(a.mode);
    const bi = MODE_ORDER.indexOf(b.mode);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const modes = Array.from(new Set(sorted.map(l => l.mode)));
  const disruptions = lines.filter(l => l.statuses.some(s => s.severity !== 10));

  return (
    <div className="p-6 space-y-5 max-w-5xl">
      {/* Header stats */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111827] border border-[#1e2a3a]">
          <Train className="w-4 h-4 text-sky-400" />
          <span className="text-sm text-white font-semibold">{lines.length} lines</span>
        </div>
        {disruptions.length > 0 ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-400/10 border border-orange-400/20">
            <span className="w-2 h-2 rounded-full bg-orange-400" />
            <span className="text-sm text-orange-400 font-semibold">{disruptions.length} disruption{disruptions.length !== 1 ? "s" : ""}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-400/10 border border-green-400/20">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-green-400 font-semibold">Good service on all lines</span>
          </div>
        )}
        <div className="ml-auto flex items-center gap-3 text-xs text-[#64748b]">
          {lastUpdate && <span>Updated {lastUpdate.toLocaleTimeString()}</span>}
          <button onClick={fetchData} className="p-2 bg-white/5 border border-[#1e2a3a] rounded-xl text-[#94a3b8] hover:text-white transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {loading && !lines.length && (
        <div className="flex items-center justify-center h-48">
          <RefreshCw className="w-6 h-6 text-[#64748b] animate-spin" />
        </div>
      )}

      {modes.map(mode => (
        <div key={mode}>
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-widest mb-2 capitalize">
            {mode.replace("-", " ")}
          </p>
          <div className="space-y-1.5">
            {sorted.filter(l => l.mode === mode).map(line => {
              const status  = line.statuses[0];
              const sc      = status ? severityColor(status.severity) : severityColor(10);
              const lineCol = LINE_COLORS[line.id] ?? "#64748b";
              const isOpen  = expanded === line.id;
              const hasReason = !!status?.reason;
              return (
                <div key={line.id}>
                  <button
                    className="w-full rounded-xl border border-[#1e2a3a] bg-[#111827] px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                    onClick={() => hasReason && setExpanded(isOpen ? null : line.id)}
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: lineCol }} />
                    <span className="text-sm font-semibold text-white flex-1">{line.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${sc.text} ${sc.bg} ${sc.border}`}>
                      {status?.description ?? "Unknown"}
                    </span>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sc.dot}`} />
                  </button>
                  {isOpen && status?.reason && (
                    <div className="mx-2 mb-1 px-4 py-3 rounded-b-xl bg-[#0d1224] border border-t-0 border-[#1e2a3a]">
                      <p className="text-xs text-[#94a3b8] leading-relaxed">{status.reason}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {!loading && lines.length === 0 && (
        <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-8 text-center text-[#64748b] text-sm">
          TfL status data unavailable — try refreshing
        </div>
      )}

      <p className="text-xs text-[#64748b]">Data via Transport for London (TfL) Open API · Free, no key needed</p>
    </div>
  );
}
