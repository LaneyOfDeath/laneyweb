"use client";

import { MapContainer, TileLayer, CircleMarker, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Earthquake {
  id: string; mag: number; place: string; time: number;
  lat: number; lon: number; depth: number;
}
interface Volcano { name: string; country: string; lat: number; lon: number; status: string; }

function magToColor(mag: number) {
  if (mag < 3) return "#10b981";
  if (mag < 4) return "#f59e0b";
  if (mag < 5) return "#f97316";
  if (mag < 6) return "#ef4444";
  return "#dc2626";
}

const volcanoIcon = L.divIcon({
  html: `<div style="width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:18px;">🌋</div>`,
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function EarthMapLeaflet({
  earthquakes,
  volcanoes,
}: {
  earthquakes: Earthquake[];
  volcanoes: Volcano[];
}) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ width: "100%", height: "100%", background: "#0d1224" }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; CartoDB"
      />
      {earthquakes.map(q => (
        <CircleMarker
          key={q.id}
          center={[q.lat, q.lon]}
          radius={Math.max(4, q.mag * 2.5)}
          pathOptions={{
            color: magToColor(q.mag),
            fillColor: magToColor(q.mag),
            fillOpacity: 0.5,
            weight: 1,
          }}
        >
          <Popup>
            <div style={{ color: "#e2e8f0", minWidth: 160 }}>
              <strong style={{ color: magToColor(q.mag) }}>M{q.mag.toFixed(1)}</strong><br />
              {q.place}<br />
              <span style={{ color: "#94a3b8", fontSize: 11 }}>
                Depth: {q.depth.toFixed(1)} km<br />
                {new Date(q.time).toLocaleString("en-GB")}
              </span>
            </div>
          </Popup>
        </CircleMarker>
      ))}
      {volcanoes.map((v, i) => (
        <Marker key={i} position={[v.lat, v.lon]} icon={volcanoIcon}>
          <Popup>
            <div style={{ color: "#e2e8f0" }}>
              <strong style={{ color: "#f97316" }}>{v.name}</strong><br />
              {v.country}<br />
              <span style={{ color: v.status === "Erupting" ? "#ef4444" : "#f97316", fontWeight: "bold" }}>
                {v.status}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
