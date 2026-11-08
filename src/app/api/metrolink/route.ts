import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// TfGM open data: free key from https://developer.tfgm.com (env TFGM_API_KEY).
const URL = "https://api.tfgm.com/odata/Metrolinks";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function GET() {
  const key = process.env.TFGM_API_KEY;
  if (!key) return NextResponse.json({ needsKey: true });

  try {
    const r = await fetch(URL, {
      headers: { "Ocp-Apim-Subscription-Key": key, Accept: "application/json" },
      cache: "no-store",
    });
    if (!r.ok) return NextResponse.json({ error: `TfGM ${r.status}` }, { status: 502 });
    const d = await r.json();

    // One row per platform display. Group by stop.
    const stops = new Map<string, { name: string; platforms: any[]; message: string | null }>();
    for (const p of d.value ?? []) {
      const name: string = p.StationLocation;
      if (!stops.has(name)) stops.set(name, { name, platforms: [], message: null });
      const s = stops.get(name)!;
      const trams = [0, 1, 2, 3]
        .map((i) => ({
          dest: p[`Dest${i}`],
          wait: p[`Wait${i}`],
          status: p[`Status${i}`],
          carriages: p[`Carriages${i}`],
        }))
        .filter((t) => t.dest);
      s.platforms.push({ id: p.Id, direction: p.Direction, line: p.Line, trams });
      const msg = (p.MessageBoard ?? "").trim();
      if (msg && !msg.startsWith("<no message>") && !s.message) s.message = msg;
    }

    return NextResponse.json({
      stops: [...stops.values()].sort((a, b) => a.name.localeCompare(b.name)),
      updated: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
