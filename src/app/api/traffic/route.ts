import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// TomTom Traffic API - free tier (2,500 req/day)
// HERE Traffic API - also free tier
// Without keys: OpenStreetMap + Overpass API for road data (no live flow)

const TOMTOM_KEY = process.env.TOMTOM_API_KEY ?? "";
const HERE_KEY = process.env.HERE_API_KEY ?? "";

async function fetchTomTomFlow(lat: number, lon: number, radius: number) {
  if (!TOMTOM_KEY) return null;
  try {
    const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json?point=${lat},${lon}&unit=KMPH&key=${TOMTOM_KEY}`;
    const res = await fetch(url, { next: { revalidate: 120 } });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function fetchTomTomIncidents(lat: number, lon: number, radius: number) {
  if (!TOMTOM_KEY) return [];
  try {
    const bbox = `${lon - radius},${lat - radius},${lon + radius},${lat + radius}`;
    const url = `https://api.tomtom.com/traffic/services/5/incidentDetails?bbox=${bbox}&fields={incidents{type,geometry{type,coordinates},properties{iconCategory,magnitudeOfDelay,events{description,code,iconCategory},startTime,endTime,from,to,length,delay,roadNumbers,timeValidity}}}&language=en-GB&key=${TOMTOM_KEY}`;
    const res = await fetch(url, { next: { revalidate: 120 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.incidents ?? []).slice(0, 20);
  } catch { return []; }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") ?? "51.5");
  const lon = parseFloat(searchParams.get("lon") ?? "-0.12");
  const radius = parseFloat(searchParams.get("radius") ?? "0.1");

  const [flow, incidents] = await Promise.all([
    fetchTomTomFlow(lat, lon, radius),
    fetchTomTomIncidents(lat, lon, Math.min(radius * 5, 0.5)),
  ]);

  return NextResponse.json({
    hasKey: !!TOMTOM_KEY,
    flow,
    incidents,
    timestamp: Date.now(),
  });
}
