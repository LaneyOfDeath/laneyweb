import { NextRequest, NextResponse } from "next/server";
import { STOPS } from "@/components/personal/metrolinkStops";

export const dynamic = "force-dynamic";

// TfGM closed its open-data API to new keys in 2026, so read the live departures
// that tfgm.com renders into its own stop pages (Next.js flight data).
const PAGE = "https://tfgm.com/travel-updates/live-departures/tram/";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Join the self.__next_f.push([1,"..."]) chunks back into one string.
function flight(html: string) {
  let out = "";
  const re = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try { out += JSON.parse(`"${m[1]}"`); } catch { /* skip */ }
  }
  return out;
}

// Pull the JSON object that follows `"travelInfo":` by matching braces.
function travelInfo(text: string): any | null {
  const at = text.indexOf('"travelInfo":{');
  if (at < 0) return null;
  const start = text.indexOf("{", at);
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) {
      try { return JSON.parse(text.slice(start, i + 1)); } catch { return null; }
    }
  }
  return null;
}

const clean = (v: any) => (typeof v === "string" && !v.startsWith("$") ? v : null);

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("stop") ?? "failsworth-tram";
  const stop = STOPS.find((s) => s.slug === slug);
  if (!stop) return NextResponse.json({ error: "Unknown stop" }, { status: 400 });

  try {
    const r = await fetch(PAGE + stop.slug, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LaneyWeb/1.0)", Accept: "text/html" },
      cache: "no-store",
    });
    if (!r.ok) return NextResponse.json({ error: `TfGM ${r.status}` }, { status: 502 });
    const info = travelInfo(flight(await r.text()));
    if (!info) return NextResponse.json({ error: "TfGM page changed, no departures found" }, { status: 502 });

    const trams = (info.departures ?? []).map((d: any) => ({
      dest: d.service?.destination ?? "?",
      carriages: d.service?.carriages ?? null,
      wait: typeof d.timings?.wait === "number" ? d.timings.wait : null,
      status: d.timings?.status ?? null,
    }));

    const alerts = [...(info.alerts?.location ?? []), ...(info.alerts?.service ?? [])]
      .map((a: any) => ({ title: clean(a.title), text: clean(a.description) }))
      .filter((a: any) => a.title)
      .slice(0, 6);

    return NextResponse.json({ stop: stop.name, slug: stop.slug, trams, alerts, updated: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
