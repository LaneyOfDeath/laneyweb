import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const laMin = parseFloat(searchParams.get("laMin") ?? "47");
  const laMax = parseFloat(searchParams.get("laMax") ?? "57");
  const loMin = parseFloat(searchParams.get("loMin") ?? "-5");
  const loMax = parseFloat(searchParams.get("loMax") ?? "15");

  try {
    const url = `https://api.adsb.lol/v2/bounds?lamax=${laMax}&lomax=${loMax}&lamin=${laMin}&lomin=${loMin}`;
    const res = await fetch(url, {
      headers: { "Accept": "application/json" },
      next: { revalidate: 10 },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`adsb.lol returned ${res.status}${body ? ": " + body.slice(0, 100) : ""}`);
    }

    const data = await res.json();

    const flights = (data.ac ?? [])
      .filter((a: Record<string, unknown>) => a.lat != null && a.lon != null)
      .map((a: Record<string, unknown>) => ({
        icao24: a.hex,
        callsign: (a.flight as string)?.trim() || (a.r as string) || "N/A",
        country: (a.r as string) ?? "",
        longitude: a.lon,
        latitude: a.lat,
        altitude: a.alt_baro != null && a.alt_baro !== "ground"
          ? Math.round(a.alt_baro as number)
          : null,
        onGround: a.alt_baro === "ground" || a.on_ground === true,
        velocity: a.gs != null ? Math.round(a.gs as number) : null,
        heading: a.track != null ? Math.round(a.track as number) : null,
        verticalRate: a.baro_rate ?? null,
        squawk: a.squawk ?? null,
      }))
      .slice(0, 300);

    return NextResponse.json({
      total: data.total ?? flights.length,
      shown: flights.length,
      time: data.now ?? Date.now() / 1000,
      flights,
    });
  } catch (err) {
    console.error("Aircraft API error:", err);
    return NextResponse.json({ error: "Failed to fetch aircraft data", flights: [] }, { status: 502 });
  }
}
