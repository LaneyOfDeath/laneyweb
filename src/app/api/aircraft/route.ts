import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function fetchRegion(lat: number, lon: number, dist: number): Promise<Record<string, unknown>[]> {
  const url = `https://api.adsb.lol/v2/lat/${lat.toFixed(2)}/lon/${lon.toFixed(2)}/dist/${dist}`;
  const res = await fetch(url, { next: { revalidate: 15 } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.ac ?? []) as Record<string, unknown>[];
}

function mapAircraft(a: Record<string, unknown>) {
  return {
    icao24: a.hex,
    callsign: (a.flight as string)?.trim() || (a.r as string) || "N/A",
    country: (a.r as string) ?? "",
    longitude: a.lon,
    latitude: a.lat,
    altitude: a.alt_baro != null && a.alt_baro !== "ground" ? Math.round(a.alt_baro as number) : null,
    onGround: a.alt_baro === "ground" || a.on_ground === true,
    velocity: a.gs != null ? Math.round(a.gs as number) : null,
    heading: a.track != null ? Math.round(a.track as number) : null,
    verticalRate: a.baro_rate ?? null,
    squawk: a.squawk ?? null,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const laMin = parseFloat(searchParams.get("laMin") ?? "35");
  const laMax = parseFloat(searchParams.get("laMax") ?? "71");
  const loMin = parseFloat(searchParams.get("loMin") ?? "-10");
  const loMax = parseFloat(searchParams.get("loMax") ?? "40");

  const latSpan = laMax - laMin;
  const lonSpan = loMax - loMin;

  try {
    let raw: Record<string, unknown>[];

    if (latSpan > 15 || lonSpan > 20) {
      // Large region — tile into overlapping 600nm circles
      const latSteps = Math.max(2, Math.ceil(latSpan / 16));
      const lonSteps = Math.max(2, Math.ceil(lonSpan / 22));
      const calls: Promise<Record<string, unknown>[]>[] = [];
      for (let i = 0; i < latSteps; i++) {
        for (let j = 0; j < lonSteps; j++) {
          const lat = laMin + (i + 0.5) * (latSpan / latSteps);
          const lon = loMin + (j + 0.5) * (lonSpan / lonSteps);
          calls.push(fetchRegion(lat, lon, 600));
        }
      }
      // Use allSettled so one failure doesn't wipe everything
      const results = await Promise.allSettled(calls);
      const seen = new Set<unknown>();
      raw = results
        .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
        .filter((a) => {
          if (seen.has(a.hex)) return false;
          seen.add(a.hex);
          return true;
        });
    } else {
      const dist = Math.round(Math.max(latSpan, lonSpan) / 2 * 60);
      raw = await fetchRegion((laMin + laMax) / 2, (loMin + loMax) / 2, Math.min(dist, 700));
    }

    const flights = raw
      .filter((a) => a.lat != null && a.lon != null)
      .sort(() => Math.random() - 0.5)
      .slice(0, 1000)
      .map(mapAircraft);

    return NextResponse.json({ total: raw.length, shown: flights.length, time: Date.now() / 1000, flights });
  } catch (err) {
    console.error("Aircraft API error:", err);
    return NextResponse.json({ error: "Failed to fetch aircraft data", flights: [] }, { status: 502 });
  }
}
