import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(
      "https://eonet.gsfc.nasa.gov/api/v3/events?category=wildfires&limit=100&status=open",
      { next: { revalidate: 600 } }
    );
    if (!res.ok) return NextResponse.json({ events: [], count: 0, timestamp: Date.now() });
    const data = await res.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const events = (data.events ?? []).map((e: any) => {
      const geo = e.geometry?.[0];
      return {
        id:             e.id,
        title:          e.title,
        date:           geo?.date ?? "",
        lat:            geo?.coordinates?.[1] ?? null,
        lon:            geo?.coordinates?.[0] ?? null,
        magnitude:      geo?.magnitudeValue ?? null,
        magnitudeUnit:  geo?.magnitudeUnit  ?? null,
        sources:        (e.sources ?? []).map((s: { id: string }) => s.id),
      };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }).filter((e: any) => e.lat !== null && e.lon !== null);

    return NextResponse.json({ events, count: events.length, timestamp: Date.now() });
  } catch {
    return NextResponse.json({ events: [], count: 0, timestamp: Date.now() });
  }
}
