"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ISS SVG icon
const issIcon = L.divIcon({
  html: `<div style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
      <circle cx="18" cy="18" r="16" fill="#7c3aed" fill-opacity="0.2" stroke="#7c3aed" stroke-width="1.5"/>
      <rect x="8" y="16" width="20" height="4" rx="1" fill="#a78bfa"/>
      <rect x="16" y="8" width="4" height="20" rx="1" fill="#a78bfa"/>
      <rect x="4" y="15" width="6" height="6" rx="0.5" fill="#c4b5fd" fill-opacity="0.8"/>
      <rect x="26" y="15" width="6" height="6" rx="0.5" fill="#c4b5fd" fill-opacity="0.8"/>
      <circle cx="18" cy="18" r="3" fill="#7c3aed" stroke="#a78bfa" stroke-width="1"/>
    </svg>
  </div>`,
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Approximate ISS orbital track (15 points forward/backward around current position)
function orbitTrack(lat: number, lon: number): [number, number][] {
  const points: [number, number][] = [];
  // ISS orbit: ~51.6 deg inclination, ~92 min period
  // Simplified: draw an oval representing the orbital inclination
  for (let i = -180; i <= 180; i += 10) {
    const rad = (i * Math.PI) / 180;
    const trackLat = 51.6 * Math.sin(rad);
    const trackLon = (lon + i * 0.5 + 360) % 360 - 180;
    points.push([trackLat, trackLon]);
  }
  return points;
}

export default function SpaceMapLeaflet({ lat, lon }: { lat: number; lon: number }) {
  const track = orbitTrack(lat, lon);

  return (
    <MapContainer
      center={[lat, lon]}
      zoom={3}
      style={{ width: "100%", height: "100%", background: "#0d1224" }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; CartoDB"
      />
      {/* Orbital path indicator */}
      <Polyline
        positions={track}
        pathOptions={{ color: "#7c3aed", weight: 1.5, opacity: 0.4, dashArray: "6 4" }}
      />
      <Marker position={[lat, lon]} icon={issIcon}>
        <Popup className="dark-popup">
          <div style={{ color: "#e2e8f0", background: "transparent", padding: "4px" }}>
            <strong style={{ color: "#a78bfa" }}>International Space Station</strong><br />
            Lat: {lat.toFixed(4)}°<br />
            Lon: {lon.toFixed(4)}°<br />
            Alt: ~408 km<br />
            Speed: 27,600 km/h
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
