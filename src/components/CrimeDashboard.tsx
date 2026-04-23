"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Search } from "lucide-react";
import dynamic from "next/dynamic";
import LiveTimestamp from "@/components/LiveTimestamp";
import CountUp from "@/components/CountUp";

const CrimeMapLeaflet = dynamic(() => import("./CrimeMapLeaflet"), { ssr: false });

interface Crime {
  id: string;
  category: string;
  location: { latitude: string; longitude: string; street: { name: string } };
  month: string;
  outcome_status: { category: string } | null;
}

const categoryNames: Record<string, string> = {
  "anti-social-behaviour":   "Anti-Social Behaviour",
  "bicycle-theft":            "Bicycle Theft",
  "burglary":                 "Burglary",
  "criminal-damage-arson":   "Criminal Damage & Arson",
  "drugs":                    "Drugs",
  "other-theft":              "Other Theft",
  "possession-of-weapons":   "Possession of Weapons",
  "public-order":             "Public Order",
  "robbery":                  "Robbery",
  "shoplifting":              "Shoplifting",
  "theft-from-the-person":   "Theft from Person",
  "vehicle-crime":            "Vehicle Crime",
  "violent-crime":            "Violent Crime",
  "other-crime":              "Other Crime",
};

const categoryColors: Record<string, string> = {
  "anti-social-behaviour":   "bg-orange-400",
  "bicycle-theft":            "bg-yellow-400",
  "burglary":                 "bg-red-400",
  "criminal-damage-arson":   "bg-red-600",
  "drugs":                    "bg-purple-400",
  "other-theft":              "bg-yellow-300",
  "possession-of-weapons":   "bg-red-600",
  "public-order":             "bg-orange-400",
  "robbery":                  "bg-red-400",
  "shoplifting":              "bg-yellow-400",
  "theft-from-the-person":   "bg-amber-400",
  "vehicle-crime":            "bg-blue-400",
  "violent-crime":            "bg-red-500",
  "other-crime":              "bg-slate-400",
};

const PRESETS = [
  { label: "London",       lat: 51.5074,  lng: -0.1278  },
  { label: "Manchester",   lat: 53.4808,  lng: -2.2426  },
  { label: "Birmingham",   lat: 52.4862,  lng: -1.8904  },
  { label: "Leeds",        lat: 53.8008,  lng: -1.5491  },
  { label: "Bristol",      lat: 51.4545,  lng: -2.5879  },
  { label: "Liverpool",    lat: 53.4084,  lng: -2.9916  },
  { label: "Sheffield",    lat: 53.3811,  lng: -1.4701  },
  { label: "Nottingham",   lat: 52.9548,  lng: -1.1581  },
];

function getAvailableMonths() {
  const months: { label: string; value: string }[] = [];
  const d = new Date();
  d.setMonth(d.getMonth() - 2);
  for (let i = 0; i < 12; i++) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    months.push({
      label: d.toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
      value: `${y}-${m}`,
    });
    d.setMonth(d.getMonth() - 1);
  }
  return months;
}

const MONTHS = getAvailableMonths();

export default function CrimeDashboard() {
  const [lat, setLat] = useState(51.5074);
  const [lng, setLng] = useState(-0.1278);
  const [locationName, setLocationName] = useState("London");
  const [month, setMonth] = useState(MONTHS[0].value);
  const [crimes, setCrimes] = useState<Crime[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [search, setSearch] = useState("");
  const [searchError, setSearchError] = useState("");
  const [geocoding, setGeocoding] = useState(false);

  const fetchCrimes = useCallback(async (la: number, ln: number, mo: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/crime?lat=${la}&lng=${ln}&date=${mo}`);
      const json = await res.json();
      setCrimes(json.crimes ?? []);
      setLastUpdate(new Date());
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCrimes(lat, lng, month); }, []);

  function selectPreset(preset: typeof PRESETS[number]) {
    setLat(preset.lat);
    setLng(preset.lng);
    setLocationName(preset.label);
    fetchCrimes(preset.lat, preset.lng, month);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;
    setGeocoding(true);
    setSearchError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)}&countrycodes=gb&limit=1&format=json`,
        { headers: { "User-Agent": "LaneyWeb/1.0" } }
      );
      const data = await res.json();
      if (!data.length) { setSearchError("Location not found"); return; }
      const { lat: la, lon: ln, display_name } = data[0];
      const newLat = parseFloat(la);
      const newLng = parseFloat(ln);
      setLat(newLat);
      setLng(newLng);
      setLocationName(display_name.split(",")[0]);
      fetchCrimes(newLat, newLng, month);
    } catch {
      setSearchError("Search failed");
    } finally {
      setGeocoding(false);
    }
  }

  function handleMonthChange(m: string) {
    setMonth(m);
    fetchCrimes(lat, lng, m);
  }

  // Category breakdown
  const categoryCounts = crimes.reduce<Record<string, number>>((acc, c) => {
    acc[c.category] = (acc[c.category] ?? 0) + 1;
    return acc;
  }, {});
  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const maxCount = sortedCategories[0]?.[1] ?? 1;
  const violent = crimes.filter(c => c.category === "violent-crime").length;
  const asb = crimes.filter(c => c.category === "anti-social-behaviour").length;
  const topCategory = sortedCategories[0] ? (categoryNames[sortedCategories[0][0]] ?? sortedCategories[0][0]) : "—";

  return (
    <div className="p-6 space-y-4 max-w-6xl">
      {/* Search + month + refresh */}
      <div className="flex flex-wrap gap-3 items-start">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-64">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search postcode or town…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#1e2a3a] bg-[#111827] text-white text-sm placeholder:text-[#64748b] focus:outline-none focus:border-red-400/40"
            />
          </div>
          <button
            type="submit"
            disabled={geocoding}
            className="px-4 py-2 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
          >
            {geocoding ? "…" : "Go"}
          </button>
        </form>

        <select
          value={month}
          onChange={e => handleMonthChange(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[#1e2a3a] bg-[#111827] text-white text-sm focus:outline-none focus:border-red-400/40"
        >
          {MONTHS.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        <div className="flex items-center gap-3 ml-auto">
          {lastUpdate && <LiveTimestamp date={lastUpdate} />}
          <button
            onClick={() => fetchCrimes(lat, lng, month)}
            className="p-2 bg-white/5 border border-[#1e2a3a] rounded-xl text-[#94a3b8] hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {searchError && <p className="text-xs text-red-400">{searchError}</p>}

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => selectPreset(p)}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
              locationName === p.label
                ? "bg-red-500/20 text-red-300 border-red-500/30"
                : "bg-white/5 text-[#94a3b8] border-[#1e2a3a] hover:text-white hover:bg-white/10"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total crimes", value: crimes.length, color: "text-white" },
          { label: "Violent crime", value: violent, color: violent > 50 ? "text-red-400" : "text-orange-400" },
          { label: "Anti-social behaviour", value: asb, color: "text-orange-400" },
          { label: "Most common", value: topCategory, color: "text-[#94a3b8]", small: true },
        ].map(({ label, value, color, small }) => (
          <div key={label} className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-3 text-center">
            <p className={`${small ? "text-sm font-semibold" : "text-xl font-black"} ${color}`}>
              {typeof value === "number" ? <CountUp end={value} /> : value}
            </p>
            <p className="text-[10px] text-[#64748b] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Location label */}
      <p className="text-xs text-[#64748b]">
        Showing crimes within ~1 mile of <span className="text-white font-medium">{locationName}</span> · {MONTHS.find(m => m.value === month)?.label}
        {" "}<span className="text-[#3a4a5a]">· England & Wales only · data.police.uk</span>
      </p>

      {/* Map */}
      <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] overflow-hidden" style={{ height: 400 }}>
        {!loading && crimes.length > 0 ? (
          <CrimeMapLeaflet crimes={crimes} center={[lat, lng]} />
        ) : (
          <div className="flex items-center justify-center h-full text-[#64748b] text-sm">
            {loading ? "Loading crime data…" : "No data — try a different month"}
          </div>
        )}
      </div>

      {/* Category breakdown */}
      {sortedCategories.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-widest">By category</p>
          {sortedCategories.map(([cat, count]) => (
            <div key={cat} className="flex items-center gap-3">
              <div className="w-36 flex-shrink-0 text-[11px] text-[#94a3b8] truncate">
                {categoryNames[cat] ?? cat}
              </div>
              <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${categoryColors[cat] ?? "bg-slate-400"} opacity-80`}
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <div className="w-10 text-right text-[11px] text-white font-medium">{count}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
