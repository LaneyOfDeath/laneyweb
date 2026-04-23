"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, RefreshCw, Wind, Droplets, Eye, Gauge, Sun, CloudRain, X, CloudSun, Flower2 } from "lucide-react";
import { SkeletonLine, SkeletonStatCard } from "@/components/Skeleton";
import { clsx } from "clsx";
import LiveTimestamp from "@/components/LiveTimestamp";
import AirDashboard from "@/components/AirDashboard";
import PollenDashboard from "@/components/PollenDashboard";

interface WeatherData {
  location: { name: string; country: string; lat: number; lon: number };
  current: {
    temp: number; feelsLike: number; humidity: number; precip: number;
    label: string; emoji: string; cloudCover: number; pressure: number;
    windSpeed: number; windDir: string; windGusts: number;
    uvIndex: number; visibility: number; isDay: number;
  };
  hourly: { time: string; temp: number; precip: number; code: number; wind: number }[];
  daily: {
    date: string; label: string; emoji: string;
    maxTemp: number; minTemp: number; precip: number; precipProb: number;
    windMax: number; uvMax: number; sunrise: string; sunset: string;
  }[];
  airQuality: { aqi: number; pm25: number; pm10: number; label: string; color: string } | null;
  sunMoon: {
    sunrise: string | null; sunset: string | null;
    dayLengthH: number | null; dayLengthM: number | null;
    moon: { illumination: number; name: string; emoji: string };
  } | null;
}

const POPULAR = ["London","New York","Tokyo","Sydney","Dubai","Paris","Los Angeles","Singapore","Lagos","Toronto"];

function UVBar({ value }: { value: number }) {
  const pct = Math.min((value / 11) * 100, 100);
  const color = value <= 2 ? "#10b981" : value <= 5 ? "#f59e0b" : value <= 7 ? "#f97316" : value <= 10 ? "#ef4444" : "#7c3aed";
  const label = value <= 2 ? "Low" : value <= 5 ? "Moderate" : value <= 7 ? "High" : value <= 10 ? "Very High" : "Extreme";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-[#64748b]">UV Index</span>
        <span style={{ color }} className="font-semibold">{value?.toFixed(1)} — {label}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function HourlyChart({ hours }: { hours: WeatherData["hourly"] }) {
  if (!hours.length) return null;
  const maxTemp = Math.max(...hours.map(h => h.temp));
  const minTemp = Math.min(...hours.map(h => h.temp));
  const range = maxTemp - minTemp || 1;
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max pb-1">
        {hours.slice(0, 24).map((h, i) => {
          const pct = ((h.temp - minTemp) / range) * 60 + 10;
          const time = new Date(h.time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
          return (
            <div key={i} className="flex flex-col items-center gap-1 w-14 flex-shrink-0">
              <p className="text-[10px] text-[#64748b]">{time}</p>
              <div className="w-full h-16 relative flex items-end justify-center">
                <div className="w-1.5 rounded-t-full bg-gradient-to-t from-blue-500 to-cyan-400" style={{ height: `${pct}%` }} />
              </div>
              <p className="text-xs font-semibold text-white">{Math.round(h.temp)}°</p>
              {h.precip > 20 && <p className="text-[10px] text-blue-400">{h.precip}%</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type Tab = "weather" | "air" | "pollen";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "weather", label: "Weather",     icon: CloudSun },
  { id: "air",     label: "Air Quality", icon: Wind     },
  { id: "pollen",  label: "Pollen",      icon: Flower2  },
];

export default function WeatherDashboard() {
  const [tab, setTab] = useState<Tab>("weather");
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("London");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async (targetCity: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/weather?city=${encodeURIComponent(targetCity)}`);
      if (!res.ok) throw new Error("Not found");
      const json: WeatherData = await res.json();
      setData(json);
      setLastUpdate(new Date());
    } catch {
      setError(`Could not find weather for "${targetCity}"`);
    } finally {
      setLoading(false);
    }
  }, []);

  const locateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      setLoading(true);
      const res = await fetch(`/api/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&city=My+Location`);
      const json = await res.json();
      setData(json);
      setCity("My Location");
      setLastUpdate(new Date());
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(city); }, []);

  const handleSearch = () => {
    if (!search.trim()) return;
    setCity(search.trim());
    fetchData(search.trim());
    setSearch("");
  };

  const { current, daily, hourly, airQuality, sunMoon, location } = data ?? {};

  return (
    <div className="p-6 space-y-5 max-w-6xl">
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              tab === id
                ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
                : "bg-white/5 text-[#94a3b8] border-[#1e2a3a] hover:text-white hover:bg-white/10"
            }`}>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Air Quality tab */}
      {tab === "air" && <AirDashboard />}

      {/* Pollen tab */}
      {tab === "pollen" && <PollenDashboard />}

      {/* Weather tab */}
      {tab === "weather" && (
        <>
          {/* Search bar */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2 bg-[#111827] border border-[#1e2a3a] rounded-xl px-3 py-2 flex-1 max-w-80">
              <Search className="w-4 h-4 text-[#64748b]" />
              <input
                type="text" value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Search any city…"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-[#64748b] outline-none"
              />
              {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-[#64748b]" /></button>}
            </div>
            <button onClick={handleSearch} className="px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl text-sm font-medium hover:bg-cyan-500/30 transition-colors">
              Search
            </button>
            <button onClick={locateMe} className="px-4 py-2 bg-white/5 text-[#94a3b8] border border-[#1e2a3a] rounded-xl text-sm hover:bg-white/10 transition-colors">
              My location
            </button>
            <button onClick={() => fetchData(city)} className="p-2 bg-white/5 border border-[#1e2a3a] rounded-xl text-[#94a3b8] hover:text-white transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            {lastUpdate && <LiveTimestamp date={lastUpdate} />}
          </div>

          {/* Popular cities */}
          <div className="flex flex-wrap gap-1.5">
            {POPULAR.map(c => (
              <button key={c} onClick={() => { setCity(c); fetchData(c); }}
                className={clsx("px-2.5 py-1 rounded-lg text-xs transition-colors border",
                  city === c ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" : "bg-white/5 text-[#64748b] border-[#1e2a3a] hover:text-white hover:bg-white/10"
                )}>
                {c}
              </button>
            ))}
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-5">
              <div className="space-y-2"><SkeletonLine w="w-48" h="h-8" /><SkeletonLine w="w-32" h="h-4" /></div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{Array.from({length:4}).map((_,i)=><SkeletonStatCard key={i}/>)}</div>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <p className="text-red-400 mb-4">{error}</p>
                <button onClick={() => fetchData("London")} className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm">
                  Back to London
                </button>
              </div>
            </div>
          )}

          {/* Main content */}
          {!loading && !error && data && current && location && (
            <>
              {/* Hero card */}
              <div className="rounded-2xl border border-[#1e2a3a] overflow-hidden"
                style={{ background: current.isDay ? "linear-gradient(135deg, #0f2742, #1a3a5c)" : "linear-gradient(135deg, #0a0e1a, #0d1a2e)" }}>
                <div className="p-6 flex flex-wrap items-start justify-between gap-6">
                  <div>
                    <p className="text-xs text-[#64748b] uppercase tracking-widest mb-1">{location.country}</p>
                    <h2 className="text-3xl font-black text-white">{location.name}</h2>
                    <p className="text-7xl font-black text-white mt-2 leading-none">{Math.round(current.temp)}°C</p>
                    <p className="text-lg text-[#94a3b8] mt-2">{current.emoji} {current.label}</p>
                    <p className="text-sm text-[#64748b] mt-1">Feels like {Math.round(current.feelsLike)}°C</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { icon: Droplets, label: "Humidity",    value: `${current.humidity}%` },
                      { icon: Wind,     label: "Wind",        value: `${Math.round(current.windSpeed)} mph ${current.windDir}` },
                      { icon: Eye,      label: "Visibility",  value: `${(current.visibility / 1000).toFixed(1)} km` },
                      { icon: Gauge,    label: "Pressure",    value: `${Math.round(current.pressure)} hPa` },
                      { icon: CloudRain,label: "Cloud cover", value: `${current.cloudCover}%` },
                      { icon: Wind,     label: "Gusts",       value: `${Math.round(current.windGusts)} mph` },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
                        <Icon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-[#64748b]">{label}</p>
                          <p className="text-white font-semibold text-sm">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <UVBar value={current.uvIndex} />
                  {airQuality && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#64748b]">Air Quality (EU AQI)</span>
                        <span style={{ color: airQuality.color }} className="font-semibold">{airQuality.aqi} — {airQuality.label}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min((airQuality.aqi / 100) * 100, 100)}%`, background: airQuality.color }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Hourly */}
              <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-4">
                <p className="text-xs font-semibold text-[#64748b] uppercase tracking-widest mb-3">24-Hour Forecast</p>
                <HourlyChart hours={hourly ?? []} />
              </div>

              {/* 7-day */}
              <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] overflow-hidden">
                <p className="px-4 pt-4 pb-2 text-xs font-semibold text-[#64748b] uppercase tracking-widest">7-Day Forecast</p>
                {(daily ?? []).map((day, i) => {
                  const date = new Date(day.date);
                  const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : date.toLocaleDateString("en-GB", { weekday: "long" });
                  return (
                    <div key={day.date} className="flex items-center gap-4 px-4 py-3 border-t border-[#1e2a3a]/50 hover:bg-white/5 transition-colors">
                      <span className="text-sm text-white w-24 flex-shrink-0 font-medium">{label}</span>
                      <span className="text-xl w-8 flex-shrink-0">{day.emoji}</span>
                      <span className="text-xs text-[#64748b] flex-1 min-w-0 truncate">{day.label}</span>
                      {day.precipProb > 20 && (
                        <span className="text-xs text-blue-400 flex items-center gap-1 flex-shrink-0">
                          <Droplets className="w-3 h-3" />{day.precipProb}%
                        </span>
                      )}
                      <div className="flex items-center gap-2 flex-shrink-0 text-sm">
                        <span className="text-[#64748b]">{Math.round(day.minTemp)}°</span>
                        <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-orange-400" />
                        </div>
                        <span className="text-white font-semibold">{Math.round(day.maxTemp)}°</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#64748b] flex-shrink-0 w-24 justify-end">
                        <Sun className="w-3 h-3" />
                        <span>{new Date(day.sunrise).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</span>
                        <span>/</span>
                        <span>{new Date(day.sunset).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sun & Moon */}
              {sunMoon && (
                <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-5">
                  <p className="text-xs font-semibold text-[#64748b] uppercase tracking-widest mb-4">Sun &amp; Moon — Today</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Sun className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs font-semibold text-yellow-400 uppercase tracking-widest">Sun</span>
                      </div>
                      <div className="flex gap-6">
                        <div>
                          <p className="text-[10px] text-[#64748b]">Day length</p>
                          <p className="text-white font-bold font-mono text-sm">
                            {sunMoon.dayLengthH !== null ? `${sunMoon.dayLengthH}h ${sunMoon.dayLengthM}m` : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#64748b]">Sunrise / Sunset</p>
                          <p className="text-white font-bold font-mono text-sm">
                            {sunMoon.sunrise ? new Date(sunMoon.sunrise).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "—"}
                            {" · "}
                            {sunMoon.sunset ? new Date(sunMoon.sunset).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base leading-none">{sunMoon.moon.emoji}</span>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Moon</span>
                      </div>
                      <div className="flex gap-6 items-end">
                        <div>
                          <p className="text-[10px] text-[#64748b]">Phase</p>
                          <p className="text-white font-bold text-sm">{sunMoon.moon.name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#64748b]">Illumination</p>
                          <p className="text-white font-bold font-mono text-sm">{sunMoon.moon.illumination}%</p>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden w-full max-w-xs">
                        <div className="h-full rounded-full bg-gradient-to-r from-slate-400 to-white" style={{ width: `${sunMoon.moon.illumination}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-xs text-[#64748b]">Data via Open-Meteo · Free, no API key · Updates every 15 min</p>
            </>
          )}
        </>
      )}
    </div>
  );
}
