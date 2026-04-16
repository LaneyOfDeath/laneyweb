"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Flight {
  icao24: string;
  callsign: string;
  country: string;
  longitude: number;
  latitude: number;
  altitude: number | null;
  onGround: boolean;
  velocity: number | null;
  heading: number | null;
  squawk: string | null;
}

interface BBox {
  laMin: number; laMax: number; loMin: number; loMax: number; label: string;
}

interface Props {
  flights: Flight[];
  region: BBox;
  onSelectFlight: (f: Flight) => void;
  selectedFlight: Flight | null;
}

// Rotate plane SVG by heading
function makePlaneIcon(heading: number | null, onGround: boolean, selected: boolean) {
  const deg = heading ?? 0;
  const color = selected ? "#06b6d4" : onGround ? "#64748b" : "#38bdf8";
  const size = selected ? 22 : 16;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" style="transform:rotate(${deg}deg);filter:drop-shadow(0 1px 3px rgba(0,0,0,0.8))"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function SetView({ region }: { region: BBox }) {
  const map = useMap();
  useEffect(() => {
    const center: [number, number] = [
      (region.laMin + region.laMax) / 2,
      (region.loMin + region.loMax) / 2,
    ];
    map.flyTo(center, 5, { duration: 1 });
  }, [map, region]);
  return null;
}

export default function AircraftMapLeaflet({ flights, region, onSelectFlight, selectedFlight }: Props) {
  const center: [number, number] = [
    (region.laMin + region.laMax) / 2,
    (region.loMin + region.loMax) / 2,
  ];

  return (
    <MapContainer
      center={center}
      zoom={5}
      style={{ height: "100%", width: "100%", background: "#0d1224" }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <SetView region={region} />
      {flights.map((f) => (
        <Marker
          key={f.icao24}
          position={[f.latitude, f.longitude]}
          icon={makePlaneIcon(f.heading, f.onGround, selectedFlight?.icao24 === f.icao24)}
          eventHandlers={{ click: () => onSelectFlight(f) }}
        >
          <Popup>
            <div className="text-xs space-y-1" style={{ color: "#e2e8f0", minWidth: 140 }}>
              <p className="font-bold text-sm text-cyan-400">{f.callsign || f.icao24}</p>
              <p>{f.country}</p>
              {f.altitude && <p>Alt: {f.altitude.toLocaleString()} ft</p>}
              {f.velocity && <p>Speed: {f.velocity} kts</p>}
              {f.heading !== null && <p>Hdg: {f.heading}°</p>}
              <p>{f.onGround ? "On ground" : "Airborne"}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
