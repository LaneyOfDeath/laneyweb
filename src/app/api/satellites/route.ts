import { NextResponse } from "next/server";
import { twoline2satrec, propagate, gstime, eciToGeodetic, degreesLat, degreesLong } from "satellite.js";

export const dynamic = "force-dynamic";

const BASE = "https://celestrak.org/NORAD/elements/gp.php?FORMAT=tle&GROUP=";

const GROUPS: Record<string, { url: string; label: string; color: string; limit: number }> = {
  stations: { url: BASE + "stations", label: "Space Stations", color: "#06b6d4", limit: 100 },
  starlink:  { url: BASE + "starlink", label: "Starlink",       color: "#a78bfa", limit: 400 },
  gps:       { url: BASE + "gps-ops",  label: "GPS",            color: "#10b981", limit: 100 },
};

function parseTLEs(text: string) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const result: { name: string; line1: string; line2: string }[] = [];
  for (let i = 0; i + 2 < lines.length; i += 3) {
    const name  = lines[i];
    const line1 = lines[i + 1];
    const line2 = lines[i + 2];
    if (line1?.startsWith("1 ") && line2?.startsWith("2 ")) {
      result.push({ name, line1, line2 });
    }
  }
  return result;
}

function getPosition(line1: string, line2: string, date: Date) {
  try {
    const satrec = twoline2satrec(line1, line2);
    const pv     = propagate(satrec, date);
    if (!pv.position || typeof pv.position === "boolean") return null;
    const gmst = gstime(date);
    const gd   = eciToGeodetic(pv.position, gmst);
    const lat  = degreesLat(gd.latitude);
    const lon  = degreesLong(gd.longitude);
    if (!isFinite(lat) || !isFinite(lon)) return null;
    return { lat, lon, alt: Math.round(gd.height) };
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const groupKey = searchParams.get("group") ?? "stations";
  const group    = GROUPS[groupKey] ?? GROUPS.stations;

  const res = await fetch(group.url, { next: { revalidate: 3600 } });
  if (!res.ok) return NextResponse.json({ error: "Could not fetch TLE data", satellites: [] }, { status: 502 });

  const text = await res.text();
  const tles = parseTLEs(text).slice(0, group.limit);
  const now  = new Date();

  const satellites = tles.flatMap(({ name, line1, line2 }) => {
    const pos = getPosition(line1, line2, now);
    if (!pos) return [];
    return [{ name: name.trim(), ...pos }];
  });

  return NextResponse.json({
    group: groupKey,
    label: group.label,
    color: group.color,
    count: satellites.length,
    satellites,
    timestamp: Date.now(),
  });
}
