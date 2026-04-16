"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  lat: number;
  lon: number;
}

const ISS_ICON = L.divIcon({
  html: `<div style="font-size:24px;line-height:1;filter:drop-shadow(0 0 6px #06b6d4)">🛸</div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function SetView({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => { map.panTo([lat, lon], { animate: true, duration: 1 }); }, [map, lat, lon]);
  return null;
}

export default function ISSMapLeaflet({ lat, lon }: Props) {
  return (
    <MapContainer center={[lat, lon]} zoom={3} style={{ height: "100%", width: "100%", background: "#0d1224" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <SetView lat={lat} lon={lon} />
      <Marker position={[lat, lon]} icon={ISS_ICON}>
        <Popup>
          <div style={{ color: "#e2e8f0" }} className="text-xs">
            <p className="font-bold text-cyan-400">ISS — International Space Station</p>
            <p>Lat: {lat.toFixed(4)}°</p>
            <p>Lon: {lon.toFixed(4)}°</p>
            <p className="text-[#64748b] mt-1">Altitude ~408 km · Speed ~27,600 km/h</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
