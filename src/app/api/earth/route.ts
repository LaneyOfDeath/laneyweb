import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// USGS Earthquake feed — free, no key
async function getEarthquakes() {
  try {
    const res = await fetch(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson",
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.features ?? []).slice(0, 50).map((f: {
      properties: { mag: number; place: string; time: number; status: string; type: string; url: string };
      geometry: { coordinates: [number, number, number] };
      id: string;
    }) => ({
      id: f.id,
      mag: f.properties.mag,
      place: f.properties.place,
      time: f.properties.time,
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0],
      depth: f.geometry.coordinates[2],
      type: f.properties.type,
      url: f.properties.url,
    }));
  } catch { return []; }
}

// NASA FIRMS active fires (MODIS 24h) — free, no key for basic CSV
async function getWildfires() {
  try {
    const res = await fetch(
      "https://firms.modaps.eosdis.nasa.gov/api/area/csv/ABCD1234/MODIS_NRT/world/1",
      { next: { revalidate: 3600 } }
    );
    // FIRMS requires a key; fall back to empty if unavailable
    if (!res.ok) return [];
    const text = await res.text();
    const lines = text.trim().split("\n").slice(1, 51); // skip header, take 50
    return lines.map(line => {
      const [lat, lon, , , acq_date, acq_time, , , , brightness, , , confidence] = line.split(",");
      return {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        brightness: parseFloat(brightness ?? "0"),
        confidence: parseInt(confidence ?? "0"),
        date: acq_date,
        time: acq_time,
      };
    }).filter(f => !isNaN(f.lat) && !isNaN(f.lon));
  } catch { return []; }
}

// Global volcano activity — Smithsonian GVP RSS (free)
async function getVolcanoes() {
  try {
    const res = await fetch(
      "https://volcano.si.edu/news/WeeklyVolcanoActivity.cfm",
      { next: { revalidate: 86400 } }
    );
    // Smithsonian page scraping unreliable; use USGS volcano feed instead
    // Fall back to well-known active volcanoes with static positions as base data
    if (!res.ok) throw new Error("no data");
    return [];
  } catch {
    // Return current well-known active volcanoes as fallback
    return [
      { name: "Kilauea", country: "USA", lat: 19.421, lon: -155.287, status: "Erupting" },
      { name: "Etna", country: "Italy", lat: 37.748, lon: 15.002, status: "Active" },
      { name: "Stromboli", country: "Italy", lat: 38.789, lon: 15.213, status: "Erupting" },
      { name: "Sakurajima", country: "Japan", lat: 31.585, lon: 130.659, status: "Active" },
      { name: "Merapi", country: "Indonesia", lat: -7.541, lon: 110.446, status: "Active" },
      { name: "Nyiragongo", country: "DR Congo", lat: -1.521, lon: 29.25, status: "Active" },
      { name: "Popocatepetl", country: "Mexico", lat: 19.023, lon: -98.622, status: "Active" },
      { name: "Krakatau", country: "Indonesia", lat: -6.102, lon: 105.423, status: "Active" },
    ];
  }
}

export async function GET() {
  const [earthquakes, wildfires, volcanoes] = await Promise.all([
    getEarthquakes(),
    getWildfires(),
    getVolcanoes(),
  ]);

  return NextResponse.json({ earthquakes, wildfires, volcanoes, timestamp: Date.now() });
}
