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

function aqiLabel(aqi: number): { label: string; color: string } {
  if (aqi <= 20)  return { label: "Good",      color: "#10b981" };
  if (aqi <= 40)  return { label: "Fair",       color: "#84cc16" };
  if (aqi <= 60)  return { label: "Moderate",   color: "#f59e0b" };
  if (aqi <= 80)  return { label: "Poor",       color: "#f97316" };
  if (aqi <= 100) return { label: "Very Poor",  color: "#ef4444" };
  return                  { label: "Hazardous", color: "#7f1d1d" };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") ?? "London";

  const location = await geocode(city);
  if (!location) return NextResponse.json({ error: `Could not find: ${city}` }, { status: 404 });

  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.lat}&longitude=${location.lon}&current=pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone,sulphur_dioxide,european_aqi,us_aqi&timezone=auto`;
  const res = await fetch(url, { next: { revalidate: 900 } });
  if (!res.ok) return NextResponse.json({ error: "Air quality data unavailable" }, { status: 502 });

  const d = await res.json();
  const c = d.current ?? {};
  const euAqi: number | null = c.european_aqi ?? null;

  return NextResponse.json({
    location,
    euAqi,
    usAqi:  c.us_aqi         ?? null,
    pm25:   c.pm2_5          ?? null,
    pm10:   c.pm10           ?? null,
    co:     c.carbon_monoxide   ?? null,
    no2:    c.nitrogen_dioxide  ?? null,
    o3:     c.ozone             ?? null,
    so2:    c.sulphur_dioxide   ?? null,
    ...(euAqi !== null ? aqiLabel(euAqi) : { label: "N/A", color: "#64748b" }),
    timestamp: Date.now(),
  });
}
