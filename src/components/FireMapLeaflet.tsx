"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface FireEvent {
  id: string; title: string; date: string;
  lat: number; lon: number;
  magnitude: number | null; magnitudeUnit: string | null;
}

export default function FireMapLeaflet({ events }: { events: FireEvent[] }) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ width: "100%", height: "100%", background: "#0d1224" }}
      zoomControl={true}
      worldCopyJump={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; CartoDB"
      />
      {events.map(e => (
        <CircleMarker
          key={e.id}
          center={[e.lat, e.lon]}
          radius={e.magnitude ? Math.min(Math.max(e.magnitude / 50, 5), 16) : 6}
          pathOptions={{ color: "#f97316", fillColor: "#ef4444", fillOpacity: 0.7, weight: 1.5 }}
        >
          <Popup>
            <div style={{ color: "#e2e8f0", minWidth: 180 }}>
              <strong style={{ color: "#f97316" }}>{e.title}</strong><br />
              {e.date && <span style={{ color: "#94a3b8", fontSize: 11 }}>{new Date(e.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>}<br />
              {e.magnitude && <span style={{ color: "#94a3b8", fontSize: 11 }}>{e.magnitude.toLocaleString()} {e.magnitudeUnit ?? "acres"}</span>}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
