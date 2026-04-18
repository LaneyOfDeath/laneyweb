"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RefreshCw, Search, Play, Square, Radio, X, Volume2 } from "lucide-react";

interface Station {
  id: string; name: string; url: string;
  favicon: string | null; tags: string[];
  country: string; countryCode: string;
  language: string; codec: string; bitrate: number; clicks: number;
}

const GENRES = ["Top 100", "Pop", "Rock", "Jazz", "Classical", "Electronic", "News", "Talk", "Hip-Hop", "Country"];
const GENRE_TAGS: Record<string, string> = {
  "Top 100": "", "Pop": "pop", "Rock": "rock", "Jazz": "jazz",
  "Classical": "classical", "Electronic": "electronic", "News": "news",
  "Talk": "talk", "Hip-Hop": "hiphop", "Country": "country",
};

export default function RadioDashboard() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading]   = useState(true);
  const [genre, setGenre]       = useState("Top 100");
  const [search, setSearch]     = useState("");
  const [query, setQuery]       = useState("");
  const [playing, setPlaying]   = useState<Station | null>(null);
  const [audioErr, setAudioErr] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchStations = useCallback(async (tag: string, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q)  params.set("q", q);
      else if (tag) params.set("tag", tag);
      const res  = await fetch(`/api/radio?${params}`);
      const json = await res.json();
      setStations(json.stations ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStations("", ""); }, [fetchStations]);

  const handleGenre = (g: string) => {
    setGenre(g);
    setQuery("");
    fetchStations(GENRE_TAGS[g] ?? "", "");
  };

  const handleSearch = () => {
    if (!search.trim()) return;
    setQuery(search.trim());
    setGenre("");
    fetchStations("", search.trim());
    setSearch("");
  };

  const playStation = (s: Station) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    if (playing?.id === s.id) {
      setPlaying(null);
      return;
    }
    setAudioErr(false);
    const audio = new Audio(s.url);
    audio.onerror = () => setAudioErr(true);
    audio.play().catch(() => setAudioErr(true));
    audioRef.current = audio;
    setPlaying(s);
  };

  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, []);

  return (
    <div className="p-6 space-y-5 max-w-5xl">
      {/* Now playing bar */}
      {playing && (
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex gap-0.5 items-end h-5 flex-shrink-0">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-1 bg-violet-400 rounded-sm animate-pulse" style={{ height: `${[14,10,18,8][i-1]}px`, animationDelay: `${i*0.1}s` }} />
              ))}
            </div>
            <Volume2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{playing.name}</p>
              <p className="text-[11px] text-violet-300">{playing.country} · {playing.codec} {playing.bitrate}kbps</p>
            </div>
          </div>
          {audioErr && <span className="text-xs text-red-400">Stream error — try another station</span>}
          <button onClick={() => playStation(playing)} className="p-1.5 bg-white/10 rounded-lg text-violet-300 hover:text-white transition-colors">
            <Square className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search + genre tabs */}
      <div className="space-y-3">
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2 bg-[#111827] border border-[#1e2a3a] rounded-xl px-3 py-2 flex-1 max-w-72">
            <Search className="w-4 h-4 text-[#64748b]" />
            <input
              type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Search stations…"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-[#64748b] outline-none"
            />
            {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-[#64748b]" /></button>}
          </div>
          <button onClick={handleSearch} className="px-4 py-2 bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-xl text-sm font-medium hover:bg-violet-500/30 transition-colors">
            Search
          </button>
          <button onClick={() => fetchStations(GENRE_TAGS[genre] ?? "", "")} className="p-2 bg-white/5 border border-[#1e2a3a] rounded-xl text-[#94a3b8] hover:text-white transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {GENRES.map(g => (
            <button key={g} onClick={() => handleGenre(g)}
              className={`px-2.5 py-1 rounded-lg text-xs transition-colors border ${
                genre === g && !query ? "bg-violet-500/20 text-violet-400 border-violet-500/30" : "bg-white/5 text-[#64748b] border-[#1e2a3a] hover:text-white hover:bg-white/10"
              }`}>
              {g}
            </button>
          ))}
          {query && <span className="px-2.5 py-1 rounded-lg text-xs bg-violet-500/20 text-violet-400 border border-violet-500/30">Search: {query}</span>}
        </div>
      </div>

      {/* Station list */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <RefreshCw className="w-6 h-6 text-[#64748b] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {stations.map(s => {
            const isPlaying = playing?.id === s.id;
            return (
              <button key={s.id} onClick={() => playStation(s)}
                className={`rounded-xl border p-3 flex items-center gap-3 transition-all text-left ${
                  isPlaying ? "border-violet-500/40 bg-violet-500/10" : "border-[#1e2a3a] bg-[#111827] hover:bg-white/5"
                }`}>
                {/* Favicon or placeholder */}
                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden bg-white/5 border border-[#1e2a3a]">
                  {s.favicon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.favicon} alt="" className="w-8 h-8 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <Radio className="w-4 h-4 text-[#64748b]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{s.name}</p>
                  <p className="text-[11px] text-[#64748b] truncate">{s.country} · {s.codec} {s.bitrate > 0 ? `${s.bitrate}k` : ""}</p>
                  {s.tags.length > 0 && (
                    <p className="text-[10px] text-[#475569] truncate">{s.tags.join(", ")}</p>
                  )}
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  isPlaying ? "bg-violet-500 text-white" : "bg-white/5 text-[#64748b] hover:text-white"
                }`}>
                  {isPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </div>
              </button>
            );
          })}
          {stations.length === 0 && (
            <div className="col-span-2 rounded-xl border border-[#1e2a3a] bg-[#111827] p-8 text-center text-[#64748b] text-sm">
              No stations found
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-[#64748b]">Data via radio-browser.info · Community-maintained, free · Click a station to stream</p>
    </div>
  );
}
