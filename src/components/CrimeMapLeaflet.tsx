"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Crime {
  id: string;
  category: string;
  location: { latitude: string; longitude: string; street: { name: string } };
  month: string;
  outcome_status: { category: string } | null;
}

const categoryColors: Record<string, string> = {
  "anti-social-behaviour":   "#f97316",
  "bicycle-theft":            "#eab308",
  "burglary":                 "#ef4444",
  "criminal-damage-arson":   "#dc2626",
  "drugs":                    "#a855f7",
  "other-theft":              "#fbbf24",
  "possession-of-weapons":   "#dc2626",
  "public-order":             "#f97316",
  "robbery":                  "#ef4444",
  "shoplifting":              "#eab308",
  "theft-from-the-person":   "#f59e0b",
  "vehicle-crime":            "#3b82f6",
  "violent-crime":            "#dc2626",
  "other-crime":              "#64748b",
};

const categoryNames: Record<string, string> = {
  "anti-social-behaviour":   "Anti-Social Behaviour",
  "bicycle-theft":            "Bicycle Theft",
  "burglary":                 "Burglary",
  "criminal-damage-arson":   "Criminal Damage & Arson",
  "drugs":                    "Drugs",
  "other-theft":              "Other Theft",
  "possession-of-weapons":   "Possession of Weapons",
  "public-order":             "Public Order",
  "robbery":                  "Robbery",
  "shoplifting":              "Shoplifting",
  "theft-from-the-person":   "Theft from Person",
  "vehicle-crime":            "Vehicle Crime",
  "violent-crime":            "Violent Crime",
  "other-crime":              "Other Crime",
};

export default function CrimeMapLeaflet({
  crimes,
  center,
}: {
  crimes: Crime[];
  center: [number, number];
}) {
  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ width: "100%", height: "100%", background: "#0d1224" }}
      zoomControl={false}
      key={`${center[0]},${center[1]}`}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; CartoDB"
      />
      {crimes.map((c) => {
        const lat = parseFloat(c.location.latitude);
        const lng = parseFloat(c.location.longitude);
        if (isNaN(lat) || isNaN(lng)) return null;
        const color = categoryColors[c.category] ?? "#64748b";
        return (
          <CircleMarker
            key={c.id}
            center={[lat, lng]}
            radius={5}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.7, weight: 0.5 }}
          >
            <Popup>
              <div style={{ color: "#e2e8f0", minWidth: 150 }}>
                <strong style={{ color }}>{categoryNames[c.category] ?? c.category}</strong><br />
                <span style={{ color: "#94a3b8", fontSize: 11 }}>
                  {c.location.street.name}<br />
                  {c.month}<br />
                  {c.outcome_status?.category ?? "No outcome recorded"}
                </span>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
