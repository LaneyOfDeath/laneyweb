"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
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

function flightColor(f: Flight, selected: boolean): string {
  if (selected) return "#06b6d4";
  if (f.onGround) return "#64748b";
  if (!f.altitude || f.altitude < 5000) return "#4ade80";
  if (f.altitude < 20000) return "#facc15";
  return "#38bdf8";
}

function CanvasFlights({ flights, onSelectFlight, selectedFlight }: {
  flights: Flight[];
  onSelectFlight: (f: Flight) => void;
  selectedFlight: Flight | null;
}) {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const flightsRef = useRef(flights);
  const selectedRef = useRef(selectedFlight);

  useEffect(() => { flightsRef.current = flights; }, [flights]);
  useEffect(() => { selectedRef.current = selectedFlight; }, [selectedFlight]);

  useEffect(() => {
    const canvas = L.DomUtil.create("canvas") as HTMLCanvasElement;
    canvas.style.cssText = "position:absolute;top:0;left:0;pointer-events:none;z-index:400";
    canvasRef.current = canvas;
    map.getPanes().overlayPane.appendChild(canvas);

    function draw() {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;

      // Reposition canvas to cancel out the overlayPane's CSS transform
      const topLeft = map.containerPointToLayerPoint([0, 0]);
      L.DomUtil.setPosition(canvas, topLeft);

      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, size.x, size.y);

      for (const f of flightsRef.current) {
        const pt = map.latLngToLayerPoint([f.latitude, f.longitude]);
        const x = pt.x - topLeft.x;
        const y = pt.y - topLeft.y;
        if (x < -20 || y < -20 || x > size.x + 20 || y > size.y + 20) continue;

        const selected = selectedRef.current?.icao24 === f.icao24;
        const color = flightColor(f, selected);
        const heading = (f.heading ?? 0) * (Math.PI / 180);
        const sz = selected ? 8 : 5;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(heading);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = selected ? 6 : 2;
        ctx.beginPath();
        ctx.moveTo(0, -sz);
        ctx.lineTo(sz * 0.5, sz * 0.3);
        ctx.lineTo(0, 0);
        ctx.lineTo(-sz * 0.5, sz * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    function onClick(e: L.LeafletMouseEvent) {
      const topLeft = map.containerPointToLayerPoint([0, 0]);
      const clickPt = map.containerPointToLayerPoint(e.containerPoint);
      let closest: Flight | null = null;
      let closestDist = 12;
      for (const f of flightsRef.current) {
        const pt = map.latLngToLayerPoint([f.latitude, f.longitude]);
        const dx = pt.x - clickPt.x;
        const dy = pt.y - clickPt.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < closestDist) { closestDist = d; closest = f; }
      }
      if (closest) onSelectFlight(closest);
    }

    map.on("move zoom viewreset", draw);
    map.on("click", onClick);
    draw();

    return () => {
      map.off("move zoom viewreset", draw);
      map.off("click", onClick);
      canvas.remove();
    };
  }, [map, onSelectFlight]);

  // Redraw when flights or selection change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !map) return;
    const size = map.getSize();
    canvas.width = size.x;
    canvas.height = size.y;
    const topLeft = map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(canvas, topLeft);
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, size.x, size.y);

    for (const f of flights) {
      const pt = map.latLngToLayerPoint([f.latitude, f.longitude]);
      const x = pt.x - topLeft.x;
      const y = pt.y - topLeft.y;
      if (x < -20 || y < -20 || x > size.x + 20 || y > size.y + 20) continue;

      const selected = selectedFlight?.icao24 === f.icao24;
      const color = flightColor(f, selected);
      const heading = (f.heading ?? 0) * (Math.PI / 180);
      const sz = selected ? 8 : 5;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(heading);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = selected ? 6 : 2;
      ctx.beginPath();
      ctx.moveTo(0, -sz);
      ctx.lineTo(sz * 0.5, sz * 0.3);
      ctx.lineTo(0, 0);
      ctx.lineTo(-sz * 0.5, sz * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }, [flights, selectedFlight, map]);

  return null;
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
      <CanvasFlights flights={flights} onSelectFlight={onSelectFlight} selectedFlight={selectedFlight} />
    </MapContainer>
  );
}
