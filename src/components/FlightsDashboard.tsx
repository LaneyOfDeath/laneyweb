"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, RefreshCw, X, PlaneTakeoff, PlaneLanding } from "lucide-react";

interface Flight {
  number: string; airline: string; airlineIata: string;
  airport: string; airportIata: string;
  scheduled: string; actual: string;
  status: string; terminal: string; gate: string;
}

interface Airport { icao: string; iata: string; name: string; country: string; }

const POPULAR: { iata: string; icao: string; name: string; flag: string }[] = [
  { iata: "LHR", icao: "EGLL", name: "Heathrow",    flag: "🇬🇧" },
  { iata: "LGW", icao: "EGKK", name: "Gatwick",     flag: "🇬🇧" },
  { iata: "MAN", icao: "EGCC", name: "Manchester",   flag: "🇬🇧" },
  { iata: "STN", icao: "EGSS", name: "Stansted",     flag: "🇬🇧" },
  { iata: "BHX", icao: "EGBB", name: "Birmingham",   flag: "🇬🇧" },
  { iata: "EDI", icao: "EGPH", name: "Edinburgh",    flag: "🇬🇧" },
  { iata: "BRS", icao: "EGGD", name: "Bristol",      flag: "🇬🇧" },
  { iata: "JFK", icao: "KJFK", name: "New York JFK", flag: "🇺🇸" },
  { iata: "LAX", icao: "KLAX", name: "Los Angeles",  flag: "🇺🇸" },
  { iata: "CDG", icao: "LFPG", name: "Paris CDG",    flag: "🇫🇷" },
  { iata: "AMS", icao: "EHAM", name: "Amsterdam",    flag: "🇳🇱" },
  { iata: "DXB", icao: "OMDB", name: "Dubai",        flag: "🇦🇪" },
];

function fmtTime(iso: string) {
  if (!iso) return "—";
  const m = iso.match(/T(\d{2}:\d{2})/);
  return m ? m[1] : "—";
}

function statusStyle(status: string) {
  const s = status.toLowerCase();
  if (s.includes("departed") || s.includes("landed"))
    return "text-green-400 bg-green-400/10 border-green-400/20";
  if (s.includes("cancel"))
    return "text-red-400 bg-red-400/10 border-red-400/20";
  if (s.includes("delay"))
    return "text-amber-400 bg-amber-400/10 border-amber-400/20";
  if (s.includes("boarding"))
    return "text-violet-400 bg-violet-400/10 border-violet-400/20";
  if (s.includes("gate closed"))
    return "text-orange-400 bg-orange-400/10 border-orange-400/20";
  return "text-cyan-400 bg-cyan-400/10 border-cyan-400/20";
}

function isDone(status: string) {
  const s = status.toLowerCase();
  return s.includes("departed") || s.includes("landed");
}

export default function FlightsDashboard() {
  const [icao, setIcao]               = useState("EGLL");
  const [airportLabel, setAirportLabel] = useState("London Heathrow (LHR)");
  const [dir, setDir]                 = useState<"Departure" | "Arrival">("Departure");
  const [flights, setFlights]         = useState<Flight[]>([]);
  const [loading, setLoading]         = useState(false);
  const [query, setQuery]             = useState("");
  const [results, setResults]         = useState<Airport[]>([]);
  const [searching, setSearching]     = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef                     = useRef<HTMLDivElement>(null);

  const fetchFlights = useCallback(async (code: string, direction: string) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/flights?icao=${code}&dir=${direction}`);
      const json = await res.json();
      setFlights(json.flights ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFlights(icao, dir); }, [fetchFlights, icao, dir]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setShowResults(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setShowResults(true);
    try {
      const res  = await fetch(`/api/flights?search=${encodeURIComponent(query.trim())}`);
      const json = await res.json();
      setResults(json.airports ?? []);
    } finally {
      setSearching(false);
    }
  };

  const selectAirport = (a: { icao: string; iata?: string; name: string }) => {
    setIcao(a.icao);
    setAirportLabel(`${a.name}${a.iata ? ` (${a.iata})` : ""}`);
    setQuery("");
    setShowResults(false);
    setResults([]);
  };

  const selectPopular = (p: typeof POPULAR[0]) => {
    setIcao(p.icao);
    setAirportLabel(`${p.flag} ${p.name} (${p.iata})`);
  };

  const pill = (active: boolean) =>
    `px-2.5 py-1 rounded-lg text-xs border transition-colors ${
      active
        ? "bg-sky-500/20 text-sky-400 border-sky-500/30"
        : "bg-white/5 text-[#64748b] border-[#1e2a3a] hover:text-white hover:bg-white/10"
    }`;

  const tabBtn = (active: boolean) =>
    `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      active
        ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
        : "text-[#64748b] hover:text-white border border-transparent"
    }`;

  return (
    <div className="p-6 space-y-5 max-w-5xl">

      {/* Airport search */}
      <div className="flex gap-2 items-center" ref={searchRef}>
        <div className="relative flex-1 max-w-80">
          <div className="flex items-center gap-2 bg-[#111827] border border-[#1e2a3a] rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-[#64748b] flex-shrink-0" />
            <input
              type="text" value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Search airport…"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-[#64748b] outline-none"
            />
            {query && (
              <button onClick={() => { setQuery(""); setShowResults(false); }}>
                <X className="w-3.5 h-3.5 text-[#64748b]" />
              </button>
            )}
          </div>

          {/* Dropdown */}
          {showResults && (
            <div className="absolute top-full mt-1 left-0 right-0 z-20 rounded-xl border border-[#1e2a3a] bg-[#0d1e30] shadow-xl overflow-hidden">
              {searching ? (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-[#64748b]">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Searching…
                </div>
              ) : results.length === 0 ? (
                <div className="px-4 py-3 text-sm text-[#64748b]">No airports found</div>
              ) : (
                results.map(a => (
                  <button key={a.icao} onClick={() => selectAirport(a)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left">
                    <span className="text-xs font-mono font-bold text-sky-400 w-8">{a.iata || a.icao}</span>
                    <div>
                      <p className="text-sm text-white">{a.name}</p>
                      <p className="text-[11px] text-[#64748b]">{a.country} · {a.icao}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <button onClick={handleSearch}
          className="px-4 py-2 bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-xl text-sm font-medium hover:bg-sky-500/30 transition-colors">
          Search
        </button>
        <button onClick={() => fetchFlights(icao, dir)}
          className="p-2 bg-white/5 border border-[#1e2a3a] rounded-xl text-[#94a3b8] hover:text-white transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Popular airports */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-widest">Popular airports</p>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR.map(p => (
            <button key={p.icao} onClick={() => selectPopular(p)} className={pill(icao === p.icao)}>
              {p.flag} {p.iata}
            </button>
          ))}
        </div>
      </div>

      {/* Airport label + tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">{airportLabel}</h2>
          <p className="text-xs text-[#64748b]">Next 5 hours · auto-refreshes every minute</p>
        </div>
        <div className="flex gap-1 bg-[#0d1e30] border border-[#1e2a3a] rounded-xl p-1">
          <button onClick={() => setDir("Departure")} className={tabBtn(dir === "Departure")}>
            <PlaneTakeoff className="w-3.5 h-3.5" /> Departures
          </button>
          <button onClick={() => setDir("Arrival")} className={tabBtn(dir === "Arrival")}>
            <PlaneLanding className="w-3.5 h-3.5" /> Arrivals
          </button>
        </div>
      </div>

      {/* Flight board */}
      <div className="rounded-xl border border-[#1e2a3a] overflow-hidden">
        {/* Column headers */}
        <div className="hidden sm:grid sm:grid-cols-[90px_90px_1fr_1fr_120px_80px] gap-3 px-4 py-2.5 bg-[#0d1e30] border-b border-[#1e2a3a]
                        text-[10px] font-semibold text-[#64748b] uppercase tracking-wider">
          <span>Sched</span>
          <span>Flight</span>
          <span>Airline</span>
          <span>{dir === "Departure" ? "Destination" : "Origin"}</span>
          <span>Status</span>
          <span>Gate</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <RefreshCw className="w-6 h-6 text-[#64748b] animate-spin" />
          </div>
        ) : flights.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-sm text-[#64748b]">
            No flights found for this window
          </div>
        ) : (
          <div className="divide-y divide-[#1e2a3a]/60">
            {flights.map((f, i) => {
              const done = isDone(f.status);
              const actualTime = fmtTime(f.actual);
              const schedTime  = fmtTime(f.scheduled);
              const hasDelay   = f.actual && f.actual !== f.scheduled && actualTime !== schedTime;
              return (
                <div key={`${f.number}-${i}`}
                  className={`flex sm:grid sm:grid-cols-[90px_90px_1fr_1fr_120px_80px] gap-3 px-4 py-3 items-center transition-colors hover:bg-white/3 ${done ? "opacity-50" : ""}`}>

                  {/* Time */}
                  <div className="flex-shrink-0 w-20 sm:w-auto">
                    <p className="text-sm font-mono font-bold text-white">{schedTime}</p>
                    {hasDelay && (
                      <p className="text-[11px] font-mono text-amber-400">{actualTime}</p>
                    )}
                  </div>

                  {/* Flight number */}
                  <div className="flex-shrink-0">
                    <span className="text-sm font-bold text-sky-400 font-mono">{f.number}</span>
                  </div>

                  {/* Airline */}
                  <div className="flex-1 sm:flex-none min-w-0">
                    <p className="text-sm text-white truncate">{f.airline || "—"}</p>
                    <p className="text-[11px] text-[#64748b] sm:hidden">{f.airport}</p>
                  </div>

                  {/* Airport (hidden on mobile — shown inline above) */}
                  <div className="hidden sm:block min-w-0">
                    <p className="text-sm text-white truncate">{f.airport || "—"}</p>
                    {f.airportIata && (
                      <p className="text-[11px] text-[#64748b]">{f.airportIata}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-semibold ${statusStyle(f.status)}`}>
                      {f.status}
                    </span>
                  </div>

                  {/* Terminal / Gate */}
                  <div className="text-sm text-[#94a3b8] flex-shrink-0">
                    {f.terminal || f.gate ? (
                      <span>{f.terminal ? `T${f.terminal}` : ""}
                        {f.terminal && f.gate ? " · " : ""}
                        {f.gate}</span>
                    ) : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-[#64748b]">
        Data via AeroDataBox · Times shown in airport local time · Departed/landed flights are dimmed
      </p>
    </div>
  );
}
