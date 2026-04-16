"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Vessel {
  mmsi: string;
  name: string;
  callsign: string;
  type: string;
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
  heading: number | null;
  status: string;
  destination: string;
  flag: string;
  length: number | null;
  draught: number | null;
}

interface Props {
  vessels: Vessel[];
  center: [number, number];
  onSelectVessel: (v: Vessel) => void;
  selectedVessel: Vessel | null;
}

function makeShipIcon(course: number, selected: boolean) {
  const color = selected ? "#06b6d4" : "#3b82f6";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${color}" style="transform:rotate(${course}deg);filter:drop-shadow(0 1px 3px rgba(0,0,0,0.8))"><path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-2 .9-2 2v4.62l-1.29.42c-.26.08-.48.26-.6.5s-.14.52-.06.78L3.95 19z"/></svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function SetCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 9, { duration: 1 });
  }, [map, center]);
  return null;
}

export default function MarineMapLeaflet({ vessels, center, onSelectVessel, selectedVessel }: Props) {
  return (
    <MapContainer
      center={center}
      zoom={9}
      style={{ height: "100%", width: "100%", background: "#0d1224" }}
    >
      {/* Base map */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* OpenSeaMap nautical overlay */}
      <TileLayer
        url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://www.openseamap.org">OpenSeaMap</a>'
        opacity={0.7}
      />
      <SetCenter center={center} />
      {vessels.map((v) => (
        <Marker
          key={v.mmsi}
          position={[v.latitude, v.longitude]}
          icon={makeShipIcon(v.course, selectedVessel?.mmsi === v.mmsi)}
          eventHandlers={{ click: () => onSelectVessel(v) }}
        >
          <Popup>
            <div style={{ color: "#e2e8f0", minWidth: 140 }} className="text-xs space-y-1">
              <p className="font-bold text-sm text-blue-400">{v.name || v.mmsi}</p>
              <p>{v.type}</p>
              <p>Speed: {v.speed.toFixed(1)} kn</p>
              <p>Status: {v.status}</p>
              {v.destination && <p>Dest: {v.destination}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
