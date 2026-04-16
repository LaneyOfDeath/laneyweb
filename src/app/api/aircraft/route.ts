import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const laMin = parseFloat(searchParams.get("laMin") ?? "47");
  const laMax = parseFloat(searchParams.get("laMax") ?? "57");
  const loMin = parseFloat(searchParams.get("loMin") ?? "-5");
  const loMax = parseFloat(searchParams.get("loMax") ?? "15");

  try {
    const url = `https://opensky-network.org/api/states/all?lamin=${laMin}&lomin=${loMin}&lamax=${laMax}&lomax=${loMax}`;
    const res = await fetch(url, {
      headers: { "Accept": "application/json" },
      next: { revalidate: 10 },
    });

    if (!res.ok) {
      throw new Error(`OpenSky returned ${res.status}`);
    }

    const data = await res.json();

    // Map OpenSky state vector array to readable objects
    // [icao24, callsign, origin_country, time_position, last_contact,
    //  longitude, latitude, baro_altitude, on_ground, velocity,
    //  true_track, vertical_rate, sensors, geo_altitude, squawk, spi, position_source]
    const flights = (data.states ?? [])
      .filter((s: unknown[]) => s[5] !== null && s[6] !== null)
      .map((s: unknown[]) => ({
        icao24: s[0],
        callsign: (s[1] as string)?.trim() || "N/A",
        country: s[2],
        longitude: s[5],
        latitude: s[6],
        altitude: s[7] ? Math.round((s[7] as number) * 3.28084) : null, // metres → ft
        onGround: s[8],
        velocity: s[9] ? Math.round((s[9] as number) * 1.94384) : null, // m/s → knots
        heading: s[10] ? Math.round(s[10] as number) : null,
        verticalRate: s[11],
        squawk: s[14],
      }))
      .slice(0, 200); // Cap at 200 for performance

    return NextResponse.json({
      total: data.states?.length ?? 0,
      shown: flights.length,
      time: data.time,
      flights,
    });
  } catch (err) {
    console.error("Aircraft API error:", err);
    return NextResponse.json({ error: "Failed to fetch aircraft data", flights: [] }, { status: 502 });
  }
}
