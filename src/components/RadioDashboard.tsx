"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RefreshCw, Search, Play, Square, X, Volume2, Star } from "lucide-react";

const PALETTE = ["#7c3aed","#0891b2","#047857","#b45309","#be123c","#4338ca","#c2410c","#0f766e"];
function stationColor(name: string) {
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}
function stationInitials(name: string) {
  const words = name.replace(/[^a-zA-Z0-9 ]/g, "").split(" ").filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

interface Station {
  id: string; name: string; url: string;
  favicon: string | null; tags: string[];
  country: string; countryCode: string;
  language: string; codec: string; bitrate: number; clicks: number;
}

type FilterMode = "country" | "tag" | "search";

const GFAV = (domain: string) => `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;

// Hardcoded major UK stations — stream URLs that are stable and don't rely on community databases
const FEATURED_UK: Station[] = [
  { id: "f-bbc1",    name: "BBC Radio 1",      url: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one",         favicon: GFAV("bbc.co.uk/radio1"),        tags: ["pop","mainstream"],       country: "United Kingdom", countryCode: "GB", language: "english", codec: "AAC", bitrate: 128, clicks: 0 },
  { id: "f-bbc2",    name: "BBC Radio 2",      url: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_two",         favicon: GFAV("bbc.co.uk/radio2"),        tags: ["pop","easy listening"],   country: "United Kingdom", countryCode: "GB", language: "english", codec: "AAC", bitrate: 128, clicks: 0 },
  { id: "f-bbc3",    name: "BBC Radio 3",      url: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_three",       favicon: GFAV("bbc.co.uk/radio3"),        tags: ["classical","culture"],    country: "United Kingdom", countryCode: "GB", language: "english", codec: "AAC", bitrate: 128, clicks: 0 },
  { id: "f-bbc4",    name: "BBC Radio 4",      url: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_fourfm",      favicon: GFAV("bbc.co.uk/radio4"),        tags: ["news","talk"],            country: "United Kingdom", countryCode: "GB", language: "english", codec: "AAC", bitrate: 128, clicks: 0 },
  { id: "f-bbc5",    name: "BBC Radio 5 Live", url: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_five_live",   favicon: GFAV("bbc.co.uk/5live"),         tags: ["news","sport"],           country: "United Kingdom", countryCode: "GB", language: "english", codec: "AAC", bitrate: 128, clicks: 0 },
  { id: "f-bbc6",    name: "BBC Radio 6 Music",url: "https://stream.live.vc.bbcmedia.co.uk/bbc_6music",            favicon: GFAV("bbc.co.uk/6music"),        tags: ["alternative","indie"],    country: "United Kingdom", countryCode: "GB", language: "english", codec: "AAC", bitrate: 128, clicks: 0 },
  { id: "f-radiox",  name: "Radio X",          url: "https://media-ice.musicradio.com/RadioXUK",                   favicon: GFAV("radiox.co.uk"),            tags: ["rock","indie","xfm"],     country: "United Kingdom", countryCode: "GB", language: "english", codec: "MP3", bitrate: 128, clicks: 0 },
  { id: "f-capital", name: "Capital FM",       url: "https://media-ice.musicradio.com/CapitalUK",                  favicon: GFAV("capitalfm.com"),           tags: ["pop","hits"],             country: "United Kingdom", countryCode: "GB", language: "english", codec: "MP3", bitrate: 128, clicks: 0 },
  { id: "f-heart",   name: "Heart FM",         url: "https://media-ice.musicradio.com/HeartUK",                    favicon: GFAV("heart.co.uk"),             tags: ["pop","easy listening"],   country: "United Kingdom", countryCode: "GB", language: "english", codec: "MP3", bitrate: 128, clicks: 0 },
  { id: "f-classic", name: "Classic FM",       url: "https://media-ice.musicradio.com/ClassicFMMP3",               favicon: GFAV("classicfm.com"),           tags: ["classical"],              country: "United Kingdom", countryCode: "GB", language: "english", codec: "MP3", bitrate: 128, clicks: 0 },
  { id: "f-lbc",     name: "LBC",              url: "https://media-ice.musicradio.com/LBCUK",                      favicon: GFAV("lbc.co.uk"),               tags: ["news","talk"],            country: "United Kingdom", countryCode: "GB", language: "english", codec: "MP3", bitrate: 128, clicks: 0 },
  { id: "f-smooth",  name: "Smooth Radio",     url: "https://media-ice.musicradio.com/SmoothUK",                   favicon: GFAV("smoothradio.com"),         tags: ["easy listening","soul"],  country: "United Kingdom", countryCode: "GB", language: "english", codec: "MP3", bitrate: 128, clicks: 0 },
  { id: "f-magic",   name: "Magic Radio",      url: "https://media-ice.musicradio.com/MagicUK",                    favicon: GFAV("magic.co.uk"),             tags: ["pop","classic"],          country: "United Kingdom", countryCode: "GB", language: "english", codec: "MP3", bitrate: 128, clicks: 0 },
  { id: "f-kiss",    name: "Kiss FM UK",       url: "https://media-ice.musicradio.com/KISSUK",                     favicon: GFAV("kissfmuk.com"),            tags: ["dance","r&b"],            country: "United Kingdom", countryCode: "GB", language: "english", codec: "MP3", bitrate: 128, clicks: 0 },
  { id: "f-absolute",name: "Absolute Radio",   url: "https://icecast.absoluteradio.co.uk/absoluteradio.mp3",       favicon: GFAV("absoluteradio.co.uk"),     tags: ["rock","classic rock"],    country: "United Kingdom", countryCode: "GB", language: "english", codec: "MP3", bitrate: 128, clicks: 0 },
  { id: "f-talksport",name:"talkSPORT",        url: "https://radio.talksport.com/stream",                          favicon: GFAV("talksport.com"),           tags: ["sport","talk"],           country: "United Kingdom", countryCode: "GB", language: "english", codec: "MP3", bitrate: 128, clicks: 0 },
  { id: "f-planet",  name: "Planet Rock",      url: "https://icecast.absoluteradio.co.uk/planetrock.mp3",          favicon: GFAV("planetrock.com"),          tags: ["rock","classic rock"],    country: "United Kingdom", countryCode: "GB", language: "english", codec: "MP3", bitrate: 128, clicks: 0 },
  { id: "f-greatest",name: "Greatest Hits Radio",url:"https://icecast.absoluteradio.co.uk/greatesthitsradio.mp3", favicon: GFAV("greatesthitsradio.co.uk"), tags: ["pop","classic"],          country: "United Kingdom", countryCode: "GB", language: "english", codec: "MP3", bitrate: 128, clicks: 0 },
];

const COUNTRIES: { label: string; code: string; flag: string }[] = [
  { label: "UK",        code: "GB", flag: "🇬🇧" },
  { label: "US",        code: "US", flag: "🇺🇸" },
  { label: "Ireland",   code: "IE", flag: "🇮🇪" },
  { label: "Australia", code: "AU", flag: "🇦🇺" },
  { label: "Canada",    code: "CA", flag: "🇨🇦" },
  { label: "Germany",   code: "DE", flag: "🇩🇪" },
  { label: "France",    code: "FR", flag: "🇫🇷" },
  { label: "Spain",     code: "ES", flag: "🇪🇸" },
];

const GENRES = ["Pop", "Rock", "Jazz", "Classical", "Electronic", "News", "Talk", "Hip-Hop"];
const GENRE_TAGS: Record<string, string> = {
  "Pop": "pop", "Rock": "rock", "Jazz": "jazz", "Classical": "classical",
  "Electronic": "electronic", "News": "news", "Talk": "talk", "Hip-Hop": "hiphop",
};

export default function RadioDashboard() {
  const [stations, setStations]   = useState<Station[]>([]);
  const [loading, setLoading]     = useState(false);
  const [mode, setMode]           = useState<FilterMode>("country");
  const [activeCountry, setActiveCountry] = useState("GB");
  const [activeGenre, setActiveGenre]     = useState("");
  const [search, setSearch]       = useState("");
  const [query, setQuery]         = useState("");
  const [playing, setPlaying]     = useState<Station | null>(null);
  const [audioErr, setAudioErr]   = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchStations = useCallback(async (params: URLSearchParams) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/radio?${params}`);
      const json = await res.json();
      setStations(json.stations ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStations(new URLSearchParams({ country: "GB" }));
  }, [fetchStations]);

  const selectCountry = (code: string) => {
    setMode("country");
    setActiveCountry(code);
    setActiveGenre("");
    setQuery("");
    fetchStations(new URLSearchParams({ country: code }));
  };

  const selectGenre = (g: string) => {
    setMode("tag");
    setActiveGenre(g);
    setActiveCountry("");
    setQuery("");
    fetchStations(new URLSearchParams({ tag: GENRE_TAGS[g] ?? g }));
  };

  const handleSearch = () => {
    if (!search.trim()) return;
    setMode("search");
    setQuery(search.trim());
    setActiveCountry("");
    setActiveGenre("");
    fetchStations(new URLSearchParams({ q: search.trim() }));
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

  useEffect(() => () => { audioRef.current?.pause(); }, []);

  const showFeatured = mode === "country" && activeCountry === "GB" && !query;

  // De-dupe radio-browser results against featured list
  const featuredIds = new Set(FEATURED_UK.map(s => s.name.toLowerCase()));
  const extraStations = stations.filter(s => !featuredIds.has(s.name.toLowerCase()));

  const pill = (active: boolean) =>
    `px-2.5 py-1 rounded-lg text-xs transition-colors border ${
      active ? "bg-violet-500/20 text-violet-400 border-violet-500/30" : "bg-white/5 text-[#64748b] border-[#1e2a3a] hover:text-white hover:bg-white/10"
    }`;

  const StationCard = ({ s }: { s: Station }) => {
    const isPlaying = playing?.id === s.id;
    return (
      <button onClick={() => playStation(s)}
        className={`rounded-xl border p-3 flex items-center gap-3 transition-all text-left w-full ${
          isPlaying ? "border-violet-500/40 bg-violet-500/10" : "border-[#1e2a3a] bg-[#111827] hover:bg-white/5"
        }`}>
        <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden bg-white/5 border border-[#1e2a3a] relative">
          {/* Initials background — always rendered, hidden if image loads */}
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white rounded-lg"
            style={{ background: stationColor(s.name) }}>
            {stationInitials(s.name)}
          </span>
          {s.favicon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.favicon} alt="" className="relative w-full h-full object-cover rounded-lg"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{s.name}</p>
          <p className="text-[11px] text-[#64748b] truncate">{s.country} · {s.codec}{s.bitrate > 0 ? ` ${s.bitrate}k` : ""}</p>
          {s.tags.length > 0 && <p className="text-[10px] text-[#475569] truncate">{s.tags.join(", ")}</p>}
        </div>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
          isPlaying ? "bg-violet-500 text-white" : "bg-white/5 text-[#64748b] hover:text-white"
        }`}>
          {isPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </div>
      </button>
    );
  };

  return (
    <div className="p-6 space-y-5 max-w-5xl">
      {/* Now playing bar */}
      {playing && (
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex gap-0.5 items-end h-5 flex-shrink-0">
              {[14,10,18,8].map((h, i) => (
                <div key={i} className="w-1 bg-violet-400 rounded-sm animate-pulse" style={{ height: h, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            <Volume2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{playing.name}</p>
              <p className="text-[11px] text-violet-300">{playing.country} · {playing.codec}{playing.bitrate > 0 ? ` ${playing.bitrate}kbps` : ""}</p>
            </div>
          </div>
          {audioErr && <span className="text-xs text-red-400 flex-shrink-0">Stream error — try another station</span>}
          <button onClick={() => playStation(playing)} className="p-1.5 bg-white/10 rounded-lg text-violet-300 hover:text-white transition-colors flex-shrink-0">
            <Square className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search */}
      <div className="flex gap-2 items-center">
        <div className="flex items-center gap-2 bg-[#111827] border border-[#1e2a3a] rounded-xl px-3 py-2 flex-1 max-w-72">
          <Search className="w-4 h-4 text-[#64748b]" />
          <input
            type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Search any station…"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-[#64748b] outline-none"
          />
          {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-[#64748b]" /></button>}
        </div>
        <button onClick={handleSearch} className="px-4 py-2 bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-xl text-sm font-medium hover:bg-violet-500/30 transition-colors">
          Search
        </button>
        <button onClick={() => {
          if (mode === "country") fetchStations(new URLSearchParams({ country: activeCountry }));
          else if (mode === "tag") fetchStations(new URLSearchParams({ tag: GENRE_TAGS[activeGenre] ?? activeGenre }));
          else if (query) fetchStations(new URLSearchParams({ q: query }));
        }} className="p-2 bg-white/5 border border-[#1e2a3a] rounded-xl text-[#94a3b8] hover:text-white transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Country pills */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-widest">By country</p>
        <div className="flex flex-wrap gap-1.5">
          {COUNTRIES.map(c => (
            <button key={c.code} onClick={() => selectCountry(c.code)} className={pill(mode === "country" && activeCountry === c.code)}>
              {c.flag} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Genre pills */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-widest">By genre</p>
        <div className="flex flex-wrap gap-1.5">
          {GENRES.map(g => (
            <button key={g} onClick={() => selectGenre(g)} className={pill(mode === "tag" && activeGenre === g)}>
              {g}
            </button>
          ))}
          {mode === "search" && query && <span className={pill(true)}>Search: {query}</span>}
        </div>
      </div>

      {/* Featured UK stations — always shown, hardcoded streams */}
      {showFeatured && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-yellow-400" />
            <p className="text-[10px] font-semibold text-yellow-400 uppercase tracking-widest">Major UK Stations</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {FEATURED_UK.map(s => <StationCard key={s.id} s={s} />)}
          </div>
        </div>
      )}

      {/* radio-browser.info results */}
      {(showFeatured ? extraStations.length > 0 : true) && (
        <div className="space-y-2">
          {showFeatured && (
            <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-widest">More UK Stations</p>
          )}
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-6 h-6 text-[#64748b] animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(showFeatured ? extraStations : stations).map(s => <StationCard key={s.id} s={s} />)}
              {!loading && (showFeatured ? extraStations : stations).length === 0 && !showFeatured && (
                <div className="col-span-2 rounded-xl border border-[#1e2a3a] bg-[#111827] p-8 text-center text-[#64748b] text-sm">
                  No stations found
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-[#64748b]">Major UK stations use direct broadcast streams · Others via radio-browser.info · Click to stream</p>
    </div>
  );
}
