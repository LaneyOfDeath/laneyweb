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

// Custom canvas layer — draws all planes in one pass, no DOM nodes per plane
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

    function resize() {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
    }

    function draw() {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const topLeft = map.containerPointToLayerPoint([0, 0]);
      ctx.save();
      ctx.translate(-topLeft.x, -topLeft.y);

      for (const f of flightsRef.current) {
        const pt = map.latLngToLayerPoint([f.latitude, f.longitude]);
        const selected = selectedRef.current?.icao24 === f.icao24;
        const color = flightColor(f, selected);
        const heading = (f.heading ?? 0) * (Math.PI / 180);
        const size = selected ? 8 : 5;

        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(heading);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = selected ? 6 : 2;

        // Draw simple plane shape
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.5, size * 0.3);
        ctx.lineTo(0, 0);
        ctx.lineTo(-size * 0.5, size * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    }

    map.on("moveend zoomend viewreset", draw);
    draw();

    // Click handler on the map pane
    function onClick(e: L.LeafletMouseEvent) {
      const clickPt = e.layerPoint;
      const topLeft = map.containerPointToLayerPoint([0, 0]);
      let closest: Flight | null = null;
      let closestDist = 12; // px threshold
      for (const f of flightsRef.current) {
        const pt = map.latLngToLayerPoint([f.latitude, f.longitude]);
        const dx = (pt.x + topLeft.x) - (clickPt.x + topLeft.x);
        const dy = (pt.y + topLeft.y) - (clickPt.y + topLeft.y);
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < closestDist) { closestDist = d; closest = f; }
      }
      if (closest) onSelectFlight(closest);
    }

    map.on("click", onClick);

    return () => {
      map.off("moveend zoomend viewreset", draw);
      map.off("click", onClick);
      canvas.remove();
    };
  }, [map, onSelectFlight]);

  // Redraw when flights or selection changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const size = map.getSize();
    canvas.width = size.x;
    canvas.height = size.y;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const topLeft = map.containerPointToLayerPoint([0, 0]);
    ctx.save();
    ctx.translate(-topLeft.x, -topLeft.y);

    for (const f of flights) {
      const pt = map.latLngToLayerPoint([f.latitude, f.longitude]);
      const selected = selectedFlight?.icao24 === f.icao24;
      const color = flightColor(f, selected);
      const heading = (f.heading ?? 0) * (Math.PI / 180);
      const sz = selected ? 8 : 5;

      ctx.save();
      ctx.translate(pt.x, pt.y);
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

    ctx.restore();
  }, [flights, selectedFlight, map]);

  return null;
}

function SetView({ region }: { region: BBox }) {
  const map = useMap();
  useEffect(() => {
    const center: [number, number] = [
      (region.laMin + region.laMax) / 2,
      (region.loMin + region.loMax) / 2,
    ];
    map.flyTo(center, 5, { duration: 1 });
  }, [map, region]);
  return null;
}

export default function AircraftMapLeaflet({ flights, region, onSelectFlight, selectedFlight }: Props) {
  const center: [number, number] = [
    (region.laMin + region.laMax) / 2,
    (region.loMin + region.loMax) / 2,
  ];

  return (
    <MapContainer
      center={center}
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
