"use client";

import { useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  center: [number, number];
  zoom: number;
  tileUrl: string;
  tileAttrib: string;
  markers: { lat: number; lon: number; label: string }[];
  userLocation: [number, number] | null;
  onMapClick: (lat: number, lon: number) => void;
  onCoordsMove: (lat: number, lon: number) => void;
}

const pinIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="28" viewBox="0 0 24 32" fill="#10b981">
    <path d="M12 0C7.6 0 4 3.6 4 8c0 5.4 8 16 8 16s8-10.6 8-16c0-4.4-3.6-8-8-8zm0 11c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z"/>
  </svg>`,
  className: "",
  iconSize: [20, 28],
  iconAnchor: [10, 28],
  popupAnchor: [0, -28],
});

const userIcon = L.divIcon({
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 8px rgba(59,130,246,0.8)"></div>`,
  className: "",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [map, center, zoom]);
  return null;
}

function MapEvents({ onMapClick, onCoordsMove }: { onMapClick: (lat: number, lon: number) => void; onCoordsMove: (lat: number, lon: number) => void }) {
  useMapEvents({
    click: (e) => onMapClick(e.latlng.lat, e.latlng.lng),
    mousemove: (e) => onCoordsMove(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

export default function GPSMapLeaflet({ center, zoom, tileUrl, tileAttrib, markers, userLocation, onMapClick, onCoordsMove }: Props) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%", background: "#0d1224" }}
      zoomControl
    >
      <TileLayer url={tileUrl} attribution={tileAttrib} />
      <MapController center={center} zoom={zoom} />
      <MapEvents onMapClick={onMapClick} onCoordsMove={onCoordsMove} />
      {userLocation && (
        <Marker position={userLocation} icon={userIcon}>
          <Popup>
            <div style={{ color: "#e2e8f0" }} className="text-xs">
              <p className="font-bold text-blue-400">Your location</p>
              <p>{userLocation[0].toFixed(6)}, {userLocation[1].toFixed(6)}</p>
            </div>
          </Popup>
        </Marker>
      )}
      {markers.map((m, i) => (
        <Marker key={i} position={[m.lat, m.lon]} icon={pinIcon}>
          <Popup>
            <div style={{ color: "#e2e8f0" }} className="text-xs">
              <p className="font-bold text-green-400">{m.label}</p>
              <p>{m.lat.toFixed(6)}, {m.lon.toFixed(6)}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
