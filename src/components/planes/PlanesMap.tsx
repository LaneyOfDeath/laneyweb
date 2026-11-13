"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  PlaneStore, Plane, Mode, Filter, WirePlane,
  altColor, passes, greatCircle, EMERGENCY_SQUAWKS,
} from "./store";

export interface RoutePoint { lat: number; lon: number; code: string }
export interface RouteLine { o: RoutePoint; d: RoutePoint }
export interface View { lat: number; lon: number; zoom: number; s: number; w: number; n: number; e: number }
export interface Feed { ok: boolean; src?: string; cells: number; capped: boolean }
export interface FlyTo { lat: number; lon: number; zoom?: number; n: number }

interface Props {
  store: PlaneStore;
  mode: Mode;
  filter: Filter;
  selected: string | null;
  follow: boolean;
  route: RouteLine | null;
  home: [number, number] | null;
  flyTo: FlyTo | null;
  initial: { lat: number; lon: number; zoom: number };
  onSelect: (hex: string | null) => void;
  onView: (v: View) => void;
  onFeed: (f: Feed) => void;
}

const MAX_CELLS = 12;

// Own silhouettes, drawn nose-up around 0,0.
const JET = new Path2D(
  "M0,-11 C1.3,-11 2,-9 2,-6 L2,-2 L11,4.5 L11,6.5 L2,3.6 L2,8 L5,10.6 L5,12 L0,10.8 L-5,12 L-5,10.6 L-2,8 L-2,3.6 L-11,6.5 L-11,4.5 L-2,-2 L-2,-6 C-2,-9 -1.3,-11 0,-11 Z",
);
const PROP = new Path2D(
  "M0,-9 L1.4,-6.5 L1.5,-3 L10,-2.4 L10,0.6 L1.5,1.4 L1,7 L4,8 L4,9.5 L0,9 L-4,9.5 L-4,8 L-1,7 L-1.5,1.4 L-10,0.6 L-10,-2.4 L-1.5,-3 L-1.4,-6.5 Z",
);
const HELI = new Path2D("M0,-5 C2.6,-5 3.4,-2.5 3.4,0 C3.4,2.6 1.6,4 0.8,4.4 L0.6,10 L2.4,10 L2.4,11.4 L-2.4,11.4 L-2.4,10 L-0.6,10 L-0.8,4.4 C-1.6,4 -3.4,2.6 -3.4,0 C-3.4,-2.5 -2.6,-5 0,-5 Z");

function shapeFor(p: Plane): { path: Path2D; k: number; heli: boolean } {
  const c = p.c ?? "";
  if (c === "A7") return { path: HELI, k: 1, heli: true };
  if (c === "A1" || c[0] === "B") return { path: PROP, k: 0.7, heli: false };
  if (c === "A2") return { path: JET, k: 0.75, heli: false };
  if (c === "A4" || c === "A5") return { path: JET, k: 1.25, heli: false };
  return { path: JET, k: 1, heli: false };
}

function visibleCells(map: L.Map) {
  const b = map.getBounds();
  const c = map.getCenter();
  const i0 = Math.max(0, Math.floor((b.getSouth() + 90) / 5));
  const i1 = Math.min(35, Math.floor((b.getNorth() + 90) / 5));
  const j0 = Math.floor((b.getWest() + 180) / 6);
  const j1 = Math.floor((b.getEast() + 180) / 6);
  const cells: { ci: number; cj: number; key: string; d: number }[] = [];
  const seen = new Set<string>();
  for (let i = i0; i <= i1; i++) {
    for (let j = j0; j <= j1 && j - j0 < 60; j++) {
      const cj = ((j % 60) + 60) % 60;
      const key = `${i}:${cj}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const d = Math.hypot(-90 + i * 5 + 2.5 - c.lat, (-180 + j * 6 + 3 - c.lng) * 0.6);
      cells.push({ ci: i, cj, key, d });
    }
  }
  cells.sort((a, b2) => a.d - b2.d);
  return { cells: cells.slice(0, MAX_CELLS), capped: cells.length > MAX_CELLS };
}

function Engine(props: Props) {
  const map = useMap();
  const ref = useRef(props);
  ref.current = props;
  const hover = useRef<string | null>(null);

  // Report the view, and remember it for next visit
  useEffect(() => {
    const report = () => {
      const b = map.getBounds();
      const c = map.getCenter();
      const v = { lat: c.lat, lon: c.lng, zoom: map.getZoom(), s: b.getSouth(), w: b.getWest(), n: b.getNorth(), e: b.getEast() };
      ref.current.onView(v);
      try {
        localStorage.setItem("planes.view", JSON.stringify({ lat: v.lat, lon: v.lon, zoom: v.zoom }));
      } catch {}
    };
    report();
    map.on("moveend", report);
    return () => { map.off("moveend", report); };
  }, [map]);

  // Fly when asked
  const fly = props.flyTo;
  useEffect(() => {
    if (fly) map.flyTo([fly.lat, fly.lon], fly.zoom ?? map.getZoom(), { duration: 0.8 });
  }, [map, fly]);

  // Keep the selected aircraft centred while following
  useEffect(() => {
    const id = setInterval(() => {
      const { follow, selected, store } = ref.current;
      if (!follow || !selected) return;
      const p = store.planes.get(selected);
      if (p) map.panTo(store.pos(p, Date.now()), { animate: true, duration: 0.6 });
    }, 1500);
    return () => clearInterval(id);
  }, [map]);

  // Data loop: refresh the stalest visible cell, gently, one request at a time
  useEffect(() => {
    let dead = false;
    const last = new Map<string, number>();
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      while (!dead) {
        if (document.hidden) { await sleep(1500); continue; }
        const { mode, store, selected } = ref.current;
        try {
          if (mode === "live") {
            const { cells, capped } = visibleCells(map);
            if (!cells.length) { await sleep(1000); continue; }
            let pick = cells[0];
            let oldest = Infinity;
            for (const c of cells) {
              const t = last.get(c.key) ?? 0;
              if (t < oldest) { oldest = t; pick = c; }
            }
            last.set(pick.key, Date.now());
            const res = await fetch(`/api/planes?ci=${pick.ci}&cj=${pick.cj}`);
            if (dead) return;
            if (res.ok) {
              const j: { ac: WirePlane[]; src?: string } = await res.json();
              store.ingest(j.ac ?? []);
              ref.current.onFeed({ ok: true, src: j.src, cells: cells.length, capped });
            } else {
              ref.current.onFeed({ ok: false, cells: cells.length, capped });
            }
            store.prune(Math.max(45000, cells.length * 4500), selected);
            await sleep(Math.max(5000 / cells.length, 1200));
          } else {
            const res = await fetch(`/api/planes?special=${mode}`);
            if (dead) return;
            if (res.ok) {
              const j: { ac: WirePlane[]; src?: string } = await res.json();
              store.ingest(j.ac ?? []);
              ref.current.onFeed({ ok: true, src: j.src, cells: 0, capped: false });
            } else {
              ref.current.onFeed({ ok: false, cells: 0, capped: false });
            }
            store.prune(70000, selected);
            for (let i = 0; i < 40 && !dead && ref.current.mode === mode; i++) await sleep(500);
          }
        } catch {
          ref.current.onFeed({ ok: false, cells: 0, capped: false });
          await sleep(3000);
        }
      }
    })();
    return () => { dead = true; };
  }, [map]);

  // Drawing + picking
  useEffect(() => {
    const box = map.getContainer();
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;z-index:450;pointer-events:none";
    box.appendChild(canvas);
    const ctx = canvas.getContext("2d")!;
    let dpr = 1;
    const resize = () => {
      const s = map.getSize();
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(s.x * dpr);
      canvas.height = Math.round(s.y * dpr);
      canvas.style.width = `${s.x}px`;
      canvas.style.height = `${s.y}px`;
    };
    resize();
    map.on("resize", resize);

    let zooming = false;
    const zs = () => { zooming = true; };
    const ze = () => { zooming = false; };
    map.on("zoomstart", zs);
    map.on("zoomend", ze);

    // screen positions from the last frame, used for click and hover picking
    let shown: { h: string; x: number; y: number }[] = [];
    const nearest = (pt: L.Point, r: number) => {
      let best: string | null = null;
      let bd = r * r;
      for (const s of shown) {
        const d = (s.x - pt.x) ** 2 + (s.y - pt.y) ** 2;
        if (d < bd) { bd = d; best = s.h; }
      }
      return best;
    };
    const onClick = (e: L.LeafletMouseEvent) => ref.current.onSelect(nearest(e.containerPoint, 18));
    const onMove = (e: L.LeafletMouseEvent) => {
      const h = nearest(e.containerPoint, 14);
      if (h !== hover.current) {
        hover.current = h;
        box.style.cursor = h ? "pointer" : "";
      }
    };
    map.on("click", onClick);
    map.on("mousemove", onMove);

    const family = getComputedStyle(box).fontFamily || "sans-serif";
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const label = (text: string, x: number, y: number, color = "#ede7d6") => {
      ctx.font = `600 12px ${family}`;
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(10,20,48,0.92)";
      ctx.strokeText(text, x, y);
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
    };
    const line = (pts: [number, number][], color: string, width: number, dash: number[] = []) => {
      ctx.beginPath();
      pts.forEach(([la, lo], i) => {
        const p = map.latLngToContainerPoint([la, lo]);
        if (i) ctx.lineTo(p.x, p.y);
        else ctx.moveTo(p.x, p.y);
      });
      ctx.setLineDash(dash);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
      ctx.setLineDash([]);
    };

    let raf = 0;
    let lastDraw = 0;
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (t - lastDraw < 40) return;
      lastDraw = t;
      const { store, mode, filter, selected, route, home } = ref.current;
      const size = map.getSize();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size.x, size.y);
      if (zooming) return;

      const now = Date.now();
      const zoom = map.getZoom();
      const scale = zoom < 5 ? 0.5 : zoom < 7 ? 0.65 : zoom < 9 ? 0.85 : zoom < 11 ? 1.05 : 1.25;
      const sel = selected ? store.planes.get(selected) : undefined;

      if (home) {
        const p = map.latLngToContainerPoint(home);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.strokeStyle = "#ede7d6";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#ffb23e";
        ctx.fill();
      }

      if (sel) {
        const here = store.pos(sel, now);
        if (route) {
          line(greatCircle(route.o.lat, route.o.lon, here[0], here[1]), "rgba(236,90,168,0.35)", 1.5, [4, 6]);
          line(greatCircle(here[0], here[1], route.d.lat, route.d.lon), "rgba(236,90,168,0.95)", 1.75, [7, 6]);
          for (const a of [route.o, route.d]) {
            const p = map.latLngToContainerPoint([a.lat, a.lon]);
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = "#ec5aa8";
            ctx.fill();
            label(a.code, p.x + 7, p.y + 4, "#f6a5cf");
          }
        }
        const tr = sel.trail;
        for (let i = 1; i < tr.length; i++) {
          line([[tr[i - 1][0], tr[i - 1][1]], [tr[i][0], tr[i][1]]], altColor({ g: 0, a: tr[i][2] }), 2.5);
        }
        if (tr.length) line([[tr[tr.length - 1][0], tr[tr.length - 1][1]], here], altColor(sel), 2.5);
      }

      const next: { h: string; x: number; y: number }[] = [];
      const many = store.planes.size > 1800;
      for (const p of store.planes.values()) {
        const isSel = p.h === selected;
        if (!isSel && !passes(p, mode, filter)) continue;
        const [la, lo] = store.pos(p, now);
        const pt = map.latLngToContainerPoint([la, lo]);
        if (pt.x < -20 || pt.y < -20 || pt.x > size.x + 20 || pt.y > size.y + 20) continue;
        next.push({ h: p.h, x: pt.x, y: pt.y });
        const color = altColor(p);
        const emergency = !!p.sq && p.sq in EMERGENCY_SQUAWKS;

        if (emergency) {
          const r = calm ? 15 : 12 + 6 * (0.5 + 0.5 * Math.sin(now / 250));
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255,107,94,0.95)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        if (isSel) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 16, 0, Math.PI * 2);
          ctx.strokeStyle = "#ffb23e";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        if ((p.c ?? "")[0] === "C") {
          ctx.fillStyle = "#64748b";
          ctx.fillRect(pt.x - 2, pt.y - 2, 4, 4);
        } else if (many && !isSel && zoom < 7) {
          ctx.fillStyle = color;
          ctx.fillRect(pt.x - 1.5, pt.y - 1.5, 3, 3);
        } else {
          const sh = shapeFor(p);
          const k = scale * sh.k * (isSel ? 1.3 : 1);
          const rot = ((p.tr ?? 0) * Math.PI) / 180;
          const cos = Math.cos(rot) * k * dpr;
          const sin = Math.sin(rot) * k * dpr;
          ctx.setTransform(cos, sin, -sin, cos, pt.x * dpr, pt.y * dpr);
          ctx.fillStyle = color;
          ctx.fill(sh.path);
          ctx.lineWidth = 0.9;
          ctx.strokeStyle = isSel ? "#ffffff" : "rgba(10,20,48,0.9)";
          ctx.stroke(sh.path);
          if (sh.heli) {
            const spin = calm ? 0.6 : now / 90;
            ctx.setTransform(Math.cos(spin) * k * dpr, Math.sin(spin) * k * dpr, -Math.sin(spin) * k * dpr, Math.cos(spin) * k * dpr, pt.x * dpr, pt.y * dpr);
            ctx.beginPath();
            ctx.moveTo(-9, 0); ctx.lineTo(9, 0); ctx.moveTo(0, -9); ctx.lineTo(0, 9);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        if (isSel || p.h === hover.current || emergency || (filter.labels && zoom >= 9 && !p.g)) {
          label(p.f || p.r || p.h.toUpperCase(), pt.x + 12 * scale, pt.y + 4, emergency ? "#ffb0a8" : "#ede7d6");
        }
      }
      shown = next;
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      map.off("resize", resize);
      map.off("zoomstart", zs);
      map.off("zoomend", ze);
      map.off("click", onClick);
      map.off("mousemove", onMove);
      canvas.remove();
    };
  }, [map]);

  return null;
}

export default function PlanesMap(props: Props) {
  return (
    <MapContainer
      center={[props.initial.lat, props.initial.lon]}
      zoom={props.initial.zoom}
      minZoom={3}
      maxZoom={14}
      worldCopyJump
      style={{ height: "100%", width: "100%", background: "#0a1430" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a> | Aircraft: adsb.lol, adsb.fi'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=cb1_54qg_1_4354911e1157db516997f2ea"
      />
      <Engine {...props} />
    </MapContainer>
  );
}
