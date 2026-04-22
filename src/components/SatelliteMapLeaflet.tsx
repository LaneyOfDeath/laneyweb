"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Sat { name: string; lat: number; lon: number; alt: number }

interface Props {
  satellites: Sat[];
  color: string;
}

export default function SatelliteMapLeaflet({ satellites, color }: Props) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      minZoom={1}
      maxZoom={6}
      worldCopyJump
      style={{ height: "100%", width: "100%", background: "#060611" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
      />
      {satellites.map(sat => (
        <CircleMarker
          key={sat.name}
          center={[sat.lat, sat.lon]}
          radius={4}
          pathOptions={{ color, fillColor: color, fillOpacity: 0.85, weight: 0 }}
        >
          <Popup>
            <div style={{ minWidth: 160 }}>
              <p style={{ color, fontWeight: 700, marginBottom: 4 }}>{sat.name}</p>
              <p style={{ color: "#94a3b8", fontSize: 11 }}>Altitude: {sat.alt} km</p>
              <p style={{ color: "#94a3b8", fontSize: 11 }}>
                {sat.lat.toFixed(2)}° {sat.lat >= 0 ? "N" : "S"} · {Math.abs(sat.lon).toFixed(2)}° {sat.lon >= 0 ? "E" : "W"}
              </p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
