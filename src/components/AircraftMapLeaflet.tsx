"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
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

const canvasRenderer = L.canvas({ padding: 0.5 });

function flightColor(f: Flight, selected: boolean): string {
  if (selected) return "#06b6d4";
  if (f.onGround) return "#64748b";
  if (!f.altitude || f.altitude < 5000) return "#4ade80";
  if (f.altitude < 20000) return "#facc15";
  return "#38bdf8";
}

function SetView({ region }: { region: BBox }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([
      (region.laMin + region.laMax) / 2,
      (region.loMin + region.loMax) / 2,
    ], 5, { duration: 0.3 });
  }, [map, region]);
  return null;
}

export default function AircraftMapLeaflet({ flights, region, onSelectFlight, selectedFlight }: Props) {
  return (
    <MapContainer
      center={[(region.laMin + region.laMax) / 2, (region.loMin + region.loMax) / 2]}
      zoom={5}
      style={{ height: "100%", width: "100%", background: "#0d1224" }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <SetView region={region} />
      {flights.map((f) => {
        const selected = selectedFlight?.icao24 === f.icao24;
        const color = flightColor(f, selected);
        return (
          <CircleMarker
            key={f.icao24}
            center={[f.latitude, f.longitude]}
            radius={selected ? 6 : 3}
            renderer={canvasRenderer}
            pathOptions={{ color, fillColor: color, fillOpacity: 1, weight: 0 }}
            eventHandlers={{ click: () => onSelectFlight(f) }}
          >
            <Popup>
              <div className="text-xs space-y-1" style={{ color: "#e2e8f0", minWidth: 140 }}>
                <p className="font-bold text-sm" style={{ color: "#06b6d4" }}>{f.callsign || f.icao24}</p>
                <p>{f.country}</p>
                {f.altitude && <p>Alt: {f.altitude.toLocaleString()} ft</p>}
                {f.velocity && <p>Speed: {f.velocity} kts</p>}
                {f.heading !== null && <p>Hdg: {f.heading}°</p>}
                <p>{f.onGround ? "On ground" : "Airborne"}</p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
