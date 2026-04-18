import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BASE = "https://aerodatabox.p.rapidapi.com";
const KEY  = process.env.RAPIDAPI_KEY ?? "";
const HDR  = () => ({
  "X-RapidAPI-Key": KEY,
  "X-RapidAPI-Host": "aerodatabox.p.rapidapi.com",
});

function fmtWindow() {
  const now  = new Date();
  const from = new Date(now.getTime() - 60 * 60 * 1000);
  const to   = new Date(now.getTime() + 5 * 60 * 60 * 1000);
  const fmt  = (d: Date) => d.toISOString().slice(0, 16);
  return { from: fmt(from), to: fmt(to) };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const icao   = searchParams.get("icao")   ?? "";
  const dir    = searchParams.get("dir")    ?? "Departure";
  const search = searchParams.get("search") ?? "";

  if (!KEY) return NextResponse.json({ error: "RAPIDAPI_KEY not set" }, { status: 500 });

  if (search) {
    try {
      const res  = await fetch(`${BASE}/airports/search/term?q=${encodeURIComponent(search)}&limit=8`, { headers: HDR() });
      const data = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const airports = ((data.items ?? []) as any[]).map(a => ({
        icao: a.icao as string,
        iata: (a.iata ?? "") as string,
        name: (a.fullName ?? a.shortName ?? a.name ?? "") as string,
        country: (a.countryCode ?? "") as string,
      }));
      return NextResponse.json({ airports });
    } catch {
      return NextResponse.json({ airports: [] });
    }
  }

  if (!icao) return NextResponse.json({ flights: [], timestamp: Date.now() });

  const { from, to } = fmtWindow();
  const qs = new URLSearchParams({
    withLeg: "true", withCancelled: "true", withCodeshared: "true",
    withCargo: "false", withPrivate: "false", direction: dir,
  });

  try {
    const res = await fetch(`${BASE}/flights/airports/icao/${icao}/${from}/${to}?${qs}`, {
      headers: HDR(),
      next: { revalidate: 60 },
    });
    if (!res.ok) return NextResponse.json({ flights: [], timestamp: Date.now() });
    const data = await res.json();

    const listKey = dir === "Departure" ? "departures" : "arrivals";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const flights = ((data[listKey] ?? []) as any[]).map(f => {
      const self  = dir === "Departure" ? f.departure : f.arrival;
      const other = dir === "Departure" ? f.arrival   : f.departure;
      return {
        number:      (f.number    ?? "") as string,
        airline:     (f.airline?.name ?? "") as string,
        airlineIata: (f.airline?.iata ?? "") as string,
        airport:     (other?.airport?.name ?? other?.airport?.iata ?? "") as string,
        airportIata: (other?.airport?.iata ?? "") as string,
        scheduled:   (self?.scheduledTime?.local ?? self?.scheduledTime?.utc ?? "") as string,
        actual:      (self?.revisedTime?.local ?? self?.actualTime?.local ?? "") as string,
        status:      (f.status ?? "Unknown") as string,
        terminal:    (self?.terminal ?? "") as string,
        gate:        (self?.gate ?? "") as string,
      };
    });

    return NextResponse.json({ flights, timestamp: Date.now() });
  } catch {
    return NextResponse.json({ flights: [], timestamp: Date.now() });
  }
}
