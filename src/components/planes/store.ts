// Shared aircraft state for the Planes page: wire format, in-memory store, geometry helpers.

export interface WirePlane {
  h: string;
  la: number;
  lo: number;
  g: number;
  f?: string;
  r?: string;
  t?: string;
  d?: string;
  a?: number;
  s?: number;
  tr?: number;
  vr?: number;
  sq?: string;
  c?: string;
  na?: number;
  sp?: number;
  ias?: number;
  mach?: number;
  wd?: number;
  ws?: number;
  oat?: number;
  qnh?: number;
  m?: number;
  em?: string;
}

export interface Plane extends WirePlane {
  ts: number; // client time (ms) the position fix was taken
  seenAt: number; // client time (ms) we last heard about it
  trail: [number, number, number][]; // lat, lon, altitude
}

export type Mode = "live" | "mil" | "emergency";
export type Band = "all" | "low" | "mid" | "high";
export interface Filter {
  ground: boolean;
  band: Band;
  labels: boolean;
}

export const EMERGENCY_SQUAWKS: Record<string, string> = {
  "7700": "General emergency",
  "7600": "Radio failure",
  "7500": "Unlawful interference",
};

const D2R = Math.PI / 180;

/** Great-circle distance in nautical miles. */
export function distNm(la1: number, lo1: number, la2: number, lo2: number): number {
  const dLa = (la2 - la1) * D2R;
  const dLo = (lo2 - lo1) * D2R;
  const x = Math.sin(dLa / 2) ** 2 + Math.cos(la1 * D2R) * Math.cos(la2 * D2R) * Math.sin(dLo / 2) ** 2;
  return 3440.065 * 2 * Math.asin(Math.min(1, Math.sqrt(x)));
}

/** Initial bearing in degrees from point 1 to point 2. */
export function bearing(la1: number, lo1: number, la2: number, lo2: number): number {
  const y = Math.sin((lo2 - lo1) * D2R) * Math.cos(la2 * D2R);
  const x =
    Math.cos(la1 * D2R) * Math.sin(la2 * D2R) -
    Math.sin(la1 * D2R) * Math.cos(la2 * D2R) * Math.cos((lo2 - lo1) * D2R);
  return (Math.atan2(y, x) / D2R + 360) % 360;
}

/** Points along the great circle between two places, for drawing a route line. */
export function greatCircle(la1: number, lo1: number, la2: number, lo2: number, n = 48): [number, number][] {
  const p1 = la1 * D2R, l1 = lo1 * D2R, p2 = la2 * D2R, l2 = lo2 * D2R;
  const d = 2 * Math.asin(Math.sqrt(Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin((l2 - l1) / 2) ** 2));
  if (!d) return [[la1, lo1], [la2, lo2]];
  const out: [number, number][] = [];
  let prevLon: number | null = null;
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(p1) * Math.cos(l1) + B * Math.cos(p2) * Math.cos(l2);
    const y = A * Math.cos(p1) * Math.sin(l1) + B * Math.cos(p2) * Math.sin(l2);
    const z = A * Math.sin(p1) + B * Math.sin(p2);
    const la = Math.atan2(z, Math.sqrt(x * x + y * y)) / D2R;
    let lo = Math.atan2(y, x) / D2R;
    // keep the line continuous across the date line
    if (prevLon != null) {
      while (lo - prevLon > 180) lo -= 360;
      while (lo - prevLon < -180) lo += 360;
    }
    prevLon = lo;
    out.push([la, lo]);
  }
  return out;
}

/** Colour for an altitude in feet: orange near the ground through green and blue to violet up high. */
export function altColor(p: { g: number; a?: number }): string {
  if (p.g) return "#7c8798";
  const a = Math.max(0, Math.min(p.a ?? 0, 43000));
  const hue = 28 + (a / 43000) * 255;
  return `hsl(${hue.toFixed(0)} 95% 60%)`;
}

export function passes(p: Plane, mode: Mode, f: Filter): boolean {
  if (mode === "mil") return p.m === 1;
  if (mode === "emergency") return !!p.sq && p.sq in EMERGENCY_SQUAWKS;
  if (p.g) return f.ground;
  const a = p.a ?? 0;
  if (f.band === "low") return a < 10000;
  if (f.band === "mid") return a >= 10000 && a < 30000;
  if (f.band === "high") return a >= 30000;
  return true;
}

export function phase(p: Plane): string {
  if (p.g) return (p.s ?? 0) > 3 ? "Taxiing" : "On the ground";
  const vr = p.vr ?? 0;
  const a = p.a ?? 0;
  if (vr > 400) return "Climbing";
  if (vr < -400) return a < 6000 ? "On approach" : "Descending";
  return a > 18000 ? "Cruising" : "Level flight";
}

export class PlaneStore {
  planes = new Map<string, Plane>();

  ingest(list: WirePlane[]) {
    const now = Date.now();
    for (const w of list) {
      if (!w || !w.h) continue;
      const ts = now - Math.min(w.sp ?? 0, 60) * 1000;
      const old = this.planes.get(w.h);
      if (old) {
        if (ts < old.ts - 500) {
          old.seenAt = now; // an older cached copy from a neighbouring cell
          continue;
        }
        const trail = old.trail;
        const last = trail[trail.length - 1];
        if (!last || distNm(last[0], last[1], w.la, w.lo) > 0.25) {
          trail.push([w.la, w.lo, w.g ? 0 : w.a ?? 0]);
          if (trail.length > 400) trail.shift();
        }
        this.planes.set(w.h, { ...w, ts, seenAt: now, trail });
      } else {
        this.planes.set(w.h, { ...w, ts, seenAt: now, trail: [[w.la, w.lo, w.g ? 0 : w.a ?? 0]] });
      }
    }
  }

  prune(maxAgeMs: number, keep?: string | null) {
    const cut = Date.now() - maxAgeMs;
    for (const [h, p] of this.planes) {
      if (p.seenAt < cut && h !== keep) this.planes.delete(h);
    }
  }

  /** Where the aircraft is right now: last fix moved forward along its track at its ground speed. */
  pos(p: Plane, now: number): [number, number] {
    const dt = (now - p.ts) / 1000;
    if (p.g || !p.s || p.tr == null || dt <= 0 || dt > 90) return [p.la, p.lo];
    const nm = (p.s * dt) / 3600;
    const la = p.la + (nm / 60) * Math.cos(p.tr * D2R);
    const lo = p.lo + ((nm / 60) * Math.sin(p.tr * D2R)) / Math.max(0.05, Math.cos(p.la * D2R));
    return [la, lo];
  }
}
