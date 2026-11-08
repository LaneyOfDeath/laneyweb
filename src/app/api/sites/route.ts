import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Public health checks for Paul's own sites.
const CHECKS = [
  { id: "chgraph", name: "chgraph", desc: "Website", url: "https://chgraph.co.uk/" },
  { id: "chgraph-api", name: "chgraph", desc: "App + database", url: "https://chgraph.co.uk/health" },
  { id: "siege", name: "StreetSiege API", desc: "Game backend", url: "https://siege-api.chgraph.co.uk/health" },
  { id: "maps", name: "StreetSiege maps", desc: "Own map server", url: "https://siege-api.chgraph.co.uk/overpass/status" },
];

/* eslint-disable @typescript-eslint/no-explicit-any */
async function check(c: (typeof CHECKS)[number]) {
  const t0 = Date.now();
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 8000);
    const r = await fetch(c.url, {
      headers: { "User-Agent": "LaneyWeb-Monitor/1.0" },
      cache: "no-store",
      signal: ctl.signal,
    });
    clearTimeout(timer);
    const ms = Date.now() - t0;
    let detail: string | null = null;
    const type = r.headers.get("content-type") ?? "";
    // Cloudflare turning the checker away (Vercel runs on AWS, which chgraph blocks) is not an outage.
    if (r.status === 403 || r.status === 429 || r.headers.get("cf-mitigated")) {
      // A real chgraph reply carries its own security headers; a Cloudflare block page does not.
      const fromCloudflare = (r.headers.get("server") ?? "").toLowerCase() === "cloudflare" && !r.headers.get("x-frame-options");
      if (r.headers.get("cf-mitigated") || fromCloudflare) {
        return { ...c, ok: true, blocked: true, status: r.status, ms, detail: "Cloudflare blocks checks from Vercel, so this can't be tested from here" };
      }
    }
    if (type.includes("json")) {
      const d: any = await r.json().catch(() => null);
      if (c.id === "chgraph-api" && d) detail = d.db ? "Database OK" : "Database DOWN";
      if (c.id === "maps" && d?.built) {
        detail = `Map data built ${new Date(d.built).toLocaleDateString("en-GB")} · ${Number(d.ways).toLocaleString("en-GB")} roads`;
      }
    }
    const ok = r.ok && !(c.id === "chgraph-api" && detail === "Database DOWN");
    return { ...c, ok, blocked: false, status: r.status, ms, detail };
  } catch (e: any) {
    return { ...c, ok: false, blocked: false, status: 0, ms: Date.now() - t0, detail: e?.name === "AbortError" ? "Timed out" : "Unreachable" };
  }
}

export async function GET() {
  const results = await Promise.all(CHECKS.map(check));
  return NextResponse.json({ results, updated: new Date().toISOString() });
}
