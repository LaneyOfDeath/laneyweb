"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Train, Search, ArrowRight, ArrowLeft, Clock } from "lucide-react";
import LiveTimestamp from "@/components/LiveTimestamp";

/* ── TfL types ── */
interface LineStatus { severity: number; description: string; reason: string | null; }
interface Line { id: string; name: string; mode: string; statuses: LineStatus[]; }

/* ── Trains types ── */
interface Service {
  uid: string; trainId: string; operator: string;
  origin: string; destination: string;
  platform: string | null; booked: string; realtime: string | null;
  cancelled: boolean; late: boolean; variation: string | null; displayAs: string;
}

const PRESETS = [
  { crs: "PAD", name: "London Paddington" },
  { crs: "WAT", name: "London Waterloo"   },
  { crs: "KGX", name: "London Kings Cross"},
  { crs: "EUS", name: "London Euston"     },
  { crs: "LBG", name: "London Bridge"     },
  { crs: "MAN", name: "Manchester Piccadilly" },
  { crs: "BHM", name: "Birmingham New St" },
  { crs: "LDS", name: "Leeds"             },
  { crs: "EDB", name: "Edinburgh"         },
  { crs: "GLC", name: "Glasgow Central"   },
  { crs: "BRI", name: "Bristol Temple Meads" },
  { crs: "NCL", name: "Newcastle"         },
];

const LINE_COLORS: Record<string, string> = {
  bakerloo: "#894e24", central: "#dc241f", circle: "#ffd329", district: "#007d32",
  "hammersmith-city": "#f4a9be", jubilee: "#a1a5a7", metropolitan: "#751056",
  northern: "#000000", piccadilly: "#0019a8", victoria: "#0098d4",
  "waterloo-city": "#93ceba", overground: "#ef7b10", "elizabeth-line": "#7156a5",
  dlr: "#00afad", tram: "#84b817",
};

function severityColor(s: number) {
  if (s === 10) return { dot: "bg-green-400",  text: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/20"  };
  if (s >= 7)   return { dot: "bg-yellow-400", text: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" };
  if (s >= 4)   return { dot: "bg-orange-400", text: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20" };
  return              { dot: "bg-red-400",    text: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/20"    };
}

function fmtTime(t: string | null | undefined) {
  if (!t) return "—";
  return t.length === 4 ? `${t.slice(0, 2)}:${t.slice(2)}` : t;
}

const MODE_ORDER = ["tube", "elizabeth-line", "overground", "dlr", "tram"];

/* ══════════════════════════════════════════════════════════ */
/* TfL Panel                                                  */
/* ══════════════════════════════════════════════════════════ */
function TflPanel() {
  const [lines,      setLines]      = useState<Line[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [expanded,   setExpanded]   = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/transport");
      const json = await res.json();
      setLines(json.lines ?? []);
      setLastUpdate(new Date());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const sorted      = [...lines].sort((a, b) => {
    const ai = MODE_ORDER.indexOf(a.mode), bi = MODE_ORDER.indexOf(b.mode);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
  const modes       = Array.from(new Set(sorted.map(l => l.mode)));
  const disruptions = lines.filter(l => l.statuses.some(s => s.severity !== 10));

  return (
    <div className="space-y-5">
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
          {lastUpdate && <LiveTimestamp date={lastUpdate} />}
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

/* ══════════════════════════════════════════════════════════ */
/* Trains Panel                                               */
/* ══════════════════════════════════════════════════════════ */
function TrainsPanel() {
  const [crs,        setCrs]        = useState("PAD");
  const [input,      setInput]      = useState("");
  const [type,       setType]       = useState<"departures"|"arrivals">("departures");
  const [services,   setServices]   = useState<Service[]>([]);
  const [stationName,setStationName]= useState("London Paddington");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string|null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date|null>(null);

  const fetchTrains = useCallback(async (station: string, serviceType: string) => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/trains?station=${station}&type=${serviceType}`);
      const json = await res.json();
      if (json.error) { setError(json.error); setServices([]); }
      else {
        setServices(json.services ?? []);
        setStationName(json.station ?? station);
        setLastUpdate(new Date());
      }
    } catch { setError("Failed to load"); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { fetchTrains(crs, type); }, [crs, type, fetchTrains]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const val = input.trim().toUpperCase().slice(0, 4);
    if (val) { setCrs(val); setInput(""); }
  }

  function statusBadge(s: Service) {
    if (s.cancelled) return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-400/10 border border-red-400/20 text-red-400">Cancelled</span>;
    if (s.realtime && s.variation && parseInt(s.variation) > 0)
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-400/10 border border-orange-400/20 text-orange-400">{s.variation} min late</span>;
    if (s.realtime)
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-400/10 border border-green-400/20 text-green-400">On time</span>;
    return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#1e2a3a] border border-[#1e2a3a] text-[#64748b]">Scheduled</span>;
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Preset stations */}
        <select
          className="bg-[#111827] border border-[#1e2a3a] text-white text-sm rounded-xl px-3 py-2"
          value={crs}
          onChange={e => setCrs(e.target.value)}
        >
          {PRESETS.map(p => <option key={p.crs} value={p.crs}>{p.name}</option>)}
        </select>

        {/* CRS search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value.toUpperCase().slice(0, 4))}
            placeholder="CRS code e.g. EXD"
            className="bg-[#111827] border border-[#1e2a3a] text-white text-sm rounded-xl px-3 py-2 w-36 placeholder:text-[#64748b]"
          />
          <button type="submit" className="p-2 bg-white/5 border border-[#1e2a3a] rounded-xl text-[#94a3b8] hover:text-white transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Dep / Arr toggle */}
        <div className="flex rounded-xl border border-[#1e2a3a] overflow-hidden">
          {(["departures", "arrivals"] as const).map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${type === t ? "bg-sky-500/20 text-sky-400" : "text-[#64748b] hover:text-white"}`}
            >
              {t === "departures" ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3 text-xs text-[#64748b]">
          {lastUpdate && <LiveTimestamp date={lastUpdate} />}
          <button onClick={() => fetchTrains(crs, type)} className="p-2 bg-white/5 border border-[#1e2a3a] rounded-xl text-[#94a3b8] hover:text-white transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Station name */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111827] border border-[#1e2a3a] w-fit">
        <Train className="w-4 h-4 text-sky-400" />
        <span className="text-sm text-white font-semibold">{stationName}</span>
        <span className="text-xs text-[#64748b]">· {crs}</span>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-48">
          <RefreshCw className="w-6 h-6 text-[#64748b] animate-spin" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-red-400 text-sm">{error}</div>
      )}

      {!loading && !error && services.length === 0 && (
        <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-8 text-center text-[#64748b] text-sm">
          No {type} found — check your RTT credentials in .env.local
        </div>
      )}

      {/* Services table */}
      {!loading && services.length > 0 && (
        <div className="space-y-1.5">
          {/* Header */}
          <div className="grid grid-cols-[70px_1fr_100px_80px_80px] gap-3 px-4 py-2 text-[11px] font-semibold text-[#64748b] uppercase tracking-widest">
            <span>Time</span>
            <span>{type === "departures" ? "Destination" : "Origin"}</span>
            <span>Operator</span>
            <span>Platform</span>
            <span>Status</span>
          </div>
          {services.map(s => (
            <div key={s.uid} className="grid grid-cols-[70px_1fr_100px_80px_80px] gap-3 items-center px-4 py-3 rounded-xl border border-[#1e2a3a] bg-[#111827] hover:bg-white/5 transition-colors">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">{fmtTime(s.booked)}</span>
                {s.realtime && s.realtime !== s.booked && (
                  <span className="text-[11px] text-orange-400 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />{fmtTime(s.realtime)}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm text-white font-medium truncate">
                  {type === "departures" ? s.destination : s.origin}
                </p>
                {type === "departures" && s.origin && s.origin !== stationName && (
                  <p className="text-[11px] text-[#64748b]">from {s.origin}</p>
                )}
              </div>
              <span className="text-xs text-[#94a3b8] truncate">{s.operator}</span>
              <span className="text-sm text-white font-semibold">
                {s.platform ? `Plat ${s.platform}` : <span className="text-[#64748b]">TBC</span>}
              </span>
              {statusBadge(s)}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-[#64748b]">Data via Realtime Trains (RTT) · Free open data</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
/* Main export                                                */
/* ══════════════════════════════════════════════════════════ */
export default function TransportDashboard() {
  const [tab, setTab] = useState<"tfl"|"trains">("tfl");

  return (
    <div className="p-6 space-y-5 max-w-5xl">
      {/* Tab bar */}
      <div className="flex rounded-xl border border-[#1e2a3a] overflow-hidden w-fit">
        {([["tfl", "TfL London"], ["trains", "National Rail"]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2 text-sm font-medium transition-colors ${tab === key ? "bg-sky-500/20 text-sky-400" : "text-[#64748b] hover:text-white"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "tfl"    && <TflPanel    />}
      {tab === "trains" && <TrainsPanel />}
    </div>
  );
}
