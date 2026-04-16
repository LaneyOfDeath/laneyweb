"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, useMap, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Incident {
  type: string;
  geometry: { type: string; coordinates: number[] | number[][] };
  properties: {
    iconCategory: number;
    magnitudeOfDelay: number;
    events?: { description: string }[];
    from?: string;
    to?: string;
  };
}

interface Props {
  center: [number, number];
  incidents: Incident[];
  hasKey: boolean;
}

const DELAY_COLORS = ["#10b981", "#f59e0b", "#f97316", "#ef4444", "#7f1d1d"];

function SetCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13, { duration: 1.2 });
  }, [map, center]);
  return null;
}

function getCoords(geometry: { type: string; coordinates: number[] | number[][] }): [number, number] | null {
  if (geometry.type === "Point") {
    const coords = geometry.coordinates as number[];
    return [coords[1], coords[0]];
  }
  if (geometry.type === "LineString") {
    const coords = geometry.coordinates as number[][];
    const mid = Math.floor(coords.length / 2);
    return [coords[mid][1], coords[mid][0]];
  }
  return null;
}

export default function TrafficMapLeaflet({ center, incidents, hasKey }: Props) {
  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "100%", width: "100%", background: "#0d1224" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {hasKey && process.env.NEXT_PUBLIC_TOMTOM_API_KEY && (
        <TileLayer
          url={`https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${process.env.NEXT_PUBLIC_TOMTOM_API_KEY}`}
          opacity={0.7}
        />
      )}
      <SetCenter center={center} />
      {incidents.map((inc, i) => {
        const pos = getCoords(inc.geometry);
        if (!pos) return null;
        const delay = inc.properties.magnitudeOfDelay ?? 0;
        const color = DELAY_COLORS[Math.min(delay, 4)];
        const desc = inc.properties.events?.[0]?.description ?? "Incident";
        return (
          <CircleMarker
            key={i}
            center={pos}
            radius={8}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.7, weight: 2 }}
          >
            <Popup>
              <div style={{ color: "#e2e8f0", minWidth: 160 }} className="text-xs space-y-1">
                <p className="font-bold text-sm" style={{ color }}>{desc}</p>
                {inc.properties.from && <p>From: {inc.properties.from}</p>}
                {inc.properties.to && <p>To: {inc.properties.to}</p>}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
