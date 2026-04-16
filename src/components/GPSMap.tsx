"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { MapPin, Search, Crosshair, Layers, X } from "lucide-react";

const MapComponent = dynamic(() => import("./GPSMapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0d1224]">
      <div className="w-8 h-8 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
    </div>
  ),
});

type MapLayer = "street" | "satellite" | "topo" | "dark";

const LAYERS: { key: MapLayer; label: string; url: string; attribution: string }[] = [
  {
    key: "dark",
    label: "Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; CARTO",
  },
  {
    key: "street",
    label: "Street",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap",
  },
  {
    key: "topo",
    label: "Topo",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenTopoMap",
  },
];

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

export default function GPSMap() {
  const [center, setCenter] = useState<[number, number]>([51.5074, -0.1278]);
  const [zoom, setZoom] = useState(10);
  const [layer, setLayer] = useState<MapLayer>("dark");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [markers, setMarkers] = useState<{ lat: number; lon: number; label: string }[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [currentCoords, setCurrentCoords] = useState<[number, number] | null>(null);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5`,
        { headers: { "Accept-Language": "en" } }
      );
      const data: SearchResult[] = await res.json();
      setSearchResults(data);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  const selectResult = (r: SearchResult) => {
    const lat = parseFloat(r.lat);
    const lon = parseFloat(r.lon);
    setCenter([lat, lon]);
    setZoom(14);
    setMarkers((prev) => [...prev, { lat, lon, label: r.display_name.split(",")[0] }]);
    setSearchResults([]);
    setSearchQuery(r.display_name.split(",")[0]);
  };

  const locateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        setCenter(coords);
        setZoom(15);
      },
      () => alert("Location access denied.")
    );
  };

  const selectedLayerConfig = LAYERS.find((l) => l.key === layer) ?? LAYERS[0];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e2a3a] flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-48 max-w-80">
          <div className="flex items-center gap-2 bg-[#111827] border border-[#1e2a3a] rounded-lg px-3 py-1.5">
            <Search className="w-3.5 h-3.5 text-[#64748b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search location…"
              className="flex-1 bg-transparent text-xs text-white placeholder:text-[#64748b] outline-none"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(""); setSearchResults([]); }}>
                <X className="w-3 h-3 text-[#64748b] hover:text-white" />
              </button>
            )}
          </div>
          {/* Dropdown results */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#111827] border border-[#1e2a3a] rounded-lg shadow-xl z-50 overflow-hidden">
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => selectResult(r)}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-white/10 border-b border-[#1e2a3a]/50 last:border-0"
                >
                  <p className="text-white font-medium truncate">{r.display_name.split(",")[0]}</p>
                  <p className="text-[#64748b] truncate">{r.display_name.split(",").slice(1, 3).join(",")}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleSearch}
          disabled={searching}
          className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50"
        >
          {searching ? "Searching…" : "Search"}
        </button>

        <button
          onClick={locateMe}
          className="px-3 py-1.5 rounded-lg bg-white/5 text-[#94a3b8] border border-[#1e2a3a] text-xs font-medium hover:bg-white/10 transition-colors flex items-center gap-1.5"
        >
          <Crosshair className="w-3.5 h-3.5" />
          My location
        </button>

        {/* Layer selector */}
        <div className="flex items-center gap-1.5 ml-auto">
          <Layers className="w-3.5 h-3.5 text-[#64748b]" />
          {LAYERS.map((l) => (
            <button
              key={l.key}
              onClick={() => setLayer(l.key)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                layer === l.key
                  ? "bg-green-500/20 text-green-400"
                  : "text-[#94a3b8] hover:text-white"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Clear markers */}
        {markers.length > 0 && (
          <button
            onClick={() => setMarkers([])}
            className="text-xs text-[#64748b] hover:text-red-400 transition-colors"
          >
            Clear pins ({markers.length})
          </button>
        )}
      </div>

      {/* Coordinates bar */}
      {currentCoords && (
        <div className="px-4 py-1.5 bg-[#0d1224] border-b border-[#1e2a3a] flex items-center gap-4 text-xs">
          <MapPin className="w-3 h-3 text-green-400" />
          <span className="text-[#94a3b8]">
            Cursor: <span className="text-white font-mono">{currentCoords[0].toFixed(6)}, {currentCoords[1].toFixed(6)}</span>
          </span>
          <span className="text-[#64748b]">
            {/* Convert to DMS */}
            {toDMS(currentCoords[0], "lat")} {toDMS(currentCoords[1], "lon")}
          </span>
        </div>
      )}

      <div className="flex-1 min-h-0">
        <MapComponent
          center={center}
          zoom={zoom}
          tileUrl={selectedLayerConfig.url}
          tileAttrib={selectedLayerConfig.attribution}
          markers={markers}
          userLocation={userLocation}
          onMapClick={(lat, lon) => {
            setCurrentCoords([lat, lon]);
          }}
          onCoordsMove={(lat, lon) => setCurrentCoords([lat, lon])}
        />
      </div>
    </div>
  );
}

function toDMS(decimal: number, type: "lat" | "lon"): string {
  const abs = Math.abs(decimal);
  const deg = Math.floor(abs);
  const minFull = (abs - deg) * 60;
  const min = Math.floor(minFull);
  const sec = ((minFull - min) * 60).toFixed(1);
  const dir = type === "lat" ? (decimal >= 0 ? "N" : "S") : (decimal >= 0 ? "E" : "W");
  return `${deg}°${min}'${sec}"${dir}`;
}
