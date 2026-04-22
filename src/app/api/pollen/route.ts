import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function geocode(city: string) {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const r = data.results?.[0];
  if (!r) return null;
  return { lat: r.latitude as number, lon: r.longitude as number, name: r.name as string, country: r.country as string };
}

function maxOrNull(arr: (number | null)[]): number | null {
  const valid = arr.filter((v): v is number => v !== null && v >= 0);
  return valid.length ? Math.max(...valid) : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") ?? "London";

  const location = await geocode(city);
  if (!location) return NextResponse.json({ error: `Could not find: ${city}` }, { status: 404 });

  const url =
    `https://air-quality-api.open-meteo.com/v1/air-quality` +
    `?latitude=${location.lat}&longitude=${location.lon}` +
    `&hourly=grass_pollen,birch_pollen,alder_pollen,mugwort_pollen,ragweed_pollen` +
    `&forecast_days=7&timezone=auto`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return NextResponse.json({ error: "Pollen data unavailable" }, { status: 502 });

  const d = await res.json();
  const times: string[]           = d.hourly?.time          ?? [];
  const grass: (number | null)[]  = d.hourly?.grass_pollen  ?? [];
  const birch: (number | null)[]  = d.hourly?.birch_pollen  ?? [];
  const alder: (number | null)[]  = d.hourly?.alder_pollen  ?? [];
  const mugwort: (number | null)[]= d.hourly?.mugwort_pollen ?? [];
  const ragweed: (number | null)[]= d.hourly?.ragweed_pollen ?? [];

  // Find index of current hour
  const nowStr = new Date().toISOString().slice(0, 13) + ":00";
  let idx = times.findIndex(t => t >= nowStr);
  if (idx === -1) idx = 0;

  // Group hourly values into daily buckets
  type DayBucket = { grass: (number|null)[]; birch: (number|null)[]; alder: (number|null)[]; mugwort: (number|null)[]; ragweed: (number|null)[] };
  const dayMap: Record<string, DayBucket> = {};
  times.forEach((t, i) => {
    const day = t.slice(0, 10);
    if (!dayMap[day]) dayMap[day] = { grass: [], birch: [], alder: [], mugwort: [], ragweed: [] };
    dayMap[day].grass.push(grass[i]);
    dayMap[day].birch.push(birch[i]);
    dayMap[day].alder.push(alder[i]);
    dayMap[day].mugwort.push(mugwort[i]);
    dayMap[day].ragweed.push(ragweed[i]);
  });

  const forecast = Object.entries(dayMap).slice(0, 7).map(([date, v]) => ({
    date,
    grass:   maxOrNull(v.grass),
    birch:   maxOrNull(v.birch),
    alder:   maxOrNull(v.alder),
    mugwort: maxOrNull(v.mugwort),
    ragweed: maxOrNull(v.ragweed),
  }));

  return NextResponse.json({
    location,
    current: { grass: grass[idx] ?? null, birch: birch[idx] ?? null, alder: alder[idx] ?? null, mugwort: mugwort[idx] ?? null, ragweed: ragweed[idx] ?? null },
    forecast,
    timestamp: Date.now(),
  });
}
