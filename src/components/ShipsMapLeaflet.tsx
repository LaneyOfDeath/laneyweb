"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface Vessel {
  mmsi: string;
  name: string;
  lat: number;
  lon: number;
  speed: number;
  course: number;
  shipType: number;
  timestamp: number;
}

interface Props {
  center: [number, number];
  zoom: number;
  vessels: Vessel[];
}

const SHIP_COLORS: Record<number, string> = {
  30: "#f59e0b", // Fishing
  31: "#06b6d4", // Towing
  36: "#a78bfa", // Sailing
  37: "#f472b6", // Pleasure craft
  60: "#3b82f6", // Passenger
  70: "#10b981", // Cargo
  80: "#ef4444", // Tanker
};

function getColor(type: number): string {
  const base = Math.floor(type / 10) * 10;
  return SHIP_COLORS[type] ?? SHIP_COLORS[base] ?? "#94a3b8";
}

function makeIcon(color: string, course: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
    <g transform="rotate(${course}, 10, 10)">
      <polygon points="10,2 14,16 10,13 6,16" fill="${color}" stroke="#0d1224" stroke-width="1.5"/>
    </g>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function SetView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, zoom, { duration: 1 }); }, [map, center, zoom]);
  return null;
}

export default function ShipsMapLeaflet({ center, zoom, vessels }: Props) {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <SetView center={center} zoom={zoom} />
      {vessels.map((v) => (
        <Marker key={v.mmsi} position={[v.lat, v.lon]} icon={makeIcon(getColor(v.shipType), v.course)}>
          <Popup>
            <div style={{ color: "#e2e8f0", minWidth: 160 }} className="text-xs space-y-1">
              <p className="font-bold text-sm" style={{ color: getColor(v.shipType) }}>
                {v.name || "Unknown Vessel"}
              </p>
              <p>MMSI: {v.mmsi}</p>
              <p>Speed: {v.speed.toFixed(1)} kn</p>
              <p>Course: {v.course}°</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
