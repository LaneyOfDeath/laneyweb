import { NextResponse } from "next/server";

// Live aircraft positions from community ADS-B feeds (adsb.lol, then adsb.fi as backup).
// The map asks for fixed 5 x 6 degree grid cells, so every viewer of the same area
// shares one cached upstream call and the feeds are never hit with continent-sized requests.

const LOL = "https://api.adsb.lol/v2";
const FI = "https://opendata.adsb.fi/api";
const UA = "laneyweb-planes/1.0 (+https://laneyweb.vercel.app)";

type Raw = Record<string, unknown>;

async function getAc(url: string): Promise<Raw[] | null> {
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(7000),
      headers: { "User-Agent": UA },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data?.ac) ? (data.ac as Raw[]) : null;
  } catch {
    return null;
  }
}

async function firstOk(urls: string[]): Promise<{ ac: Raw[]; src: string } | null> {
  for (const u of urls) {
    const ac = await getAc(u);
    if (ac) return { ac, src: new URL(u).hostname };
  }
  return null;
}

const num = (v: unknown): number | undefined => (typeof v === "number" && isFinite(v) ? v : undefined);
const str = (v: unknown): string | undefined => (typeof v === "string" && v.trim() ? v.trim() : undefined);

function slim(a: Raw) {
  const la = num(a.lat);
  const lo = num(a.lon);
  const h = str(a.hex);
  if (la == null || lo == null || !h) return null;
  const ground = a.alt_baro === "ground";
  const o: Record<string, unknown> = {
    h,
    la: Math.round(la * 1e5) / 1e5,
    lo: Math.round(lo * 1e5) / 1e5,
    g: ground ? 1 : 0,
  };
  const set = (k: string, v: unknown) => {
    if (v !== undefined && v !== null) o[k] = v;
  };
  set("f", str(a.flight));
  set("r", str(a.r));
  set("t", str(a.t));
  set("d", str(a.desc));
  set("a", ground ? 0 : num(a.alt_baro) ?? num(a.alt_geom));
  set("s", num(a.gs));
  set("tr", num(a.track) ?? num(a.true_heading));
  set("vr", num(a.baro_rate) ?? num(a.geom_rate));
  set("sq", str(a.squawk));
  set("c", str(a.category));
  set("na", num(a.nav_altitude_mcp) ?? num(a.nav_altitude_fms));
  set("sp", num(a.seen_pos));
  set("ias", num(a.ias));
  set("mach", num(a.mach));
  set("wd", num(a.wd));
  set("ws", num(a.ws));
  set("oat", num(a.oat));
  set("qnh", num(a.nav_qnh));
  if (typeof a.dbFlags === "number" && (a.dbFlags & 1) === 1) o.m = 1;
  const em = str(a.emergency);
  if (em && em !== "none") o.em = em;
  return o;
}

function reply(found: { ac: Raw[]; src: string } | null, maxAge: number) {
  if (!found) {
    return NextResponse.json({ error: "feeds unavailable", ac: [] }, { status: 502 });
  }
  const ac = found.ac.map(slim).filter(Boolean);
  return NextResponse.json(
    { now: Date.now(), src: found.src, ac },
    // next.config.ts forces Cache-Control: no-store on /api, so tell Vercel's CDN separately.
    // Everyone looking at the same patch of sky then shares one upstream request.
    { headers: { "CDN-Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}` } },
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // 1. Search by callsign, registration or 24-bit hex code
  const find = searchParams.get("find");
  if (find) {
    const q = find.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 10);
    if (q.length < 2) return NextResponse.json({ ac: [] });
    const tries: string[][] = [
      [`${LOL}/callsign/${q}`, `${FI}/v2/callsign/${q}`],
      [`${LOL}/reg/${q}`, `${FI}/v2/registration/${q}`],
    ];
    if (/^[0-9A-F]{6}$/.test(q)) {
      tries.unshift([`${LOL}/hex/${q.toLowerCase()}`, `${FI}/v2/hex/${q.toLowerCase()}`]);
    }
    let anyOk = false;
    for (const urls of tries) {
      const found = await firstOk(urls);
      if (found) {
        anyOk = true;
        if (found.ac.length) return reply(found, 5);
      }
    }
    return anyOk
      ? NextResponse.json({ now: Date.now(), ac: [] })
      : NextResponse.json({ error: "feeds unavailable", ac: [] }, { status: 502 });
  }

  // 2. Worldwide special lists
  const special = searchParams.get("special");
  if (special === "mil") {
    return reply(await firstOk([`${LOL}/mil`, `${FI}/v2/mil`]), 15);
  }
  if (special === "emergency") {
    const lists = await Promise.all(
      ["7700", "7600", "7500"].map((s) => firstOk([`${LOL}/sqk/${s}`, `${FI}/v2/sqk/${s}`])),
    );
    const ok = lists.filter((l): l is { ac: Raw[]; src: string } => l !== null);
    if (!ok.length) return reply(null, 15);
    return reply({ ac: ok.flatMap((l) => l.ac), src: ok[0].src }, 15);
  }

  // 3. One grid cell of live traffic
  const ci = parseInt(searchParams.get("ci") ?? "", 10);
  const cj = parseInt(searchParams.get("cj") ?? "", 10);
  if (!(ci >= 0 && ci < 36 && cj >= 0 && cj < 60)) {
    return NextResponse.json({ error: "bad cell", ac: [] }, { status: 400 });
  }
  const lat = (-90 + ci * 5 + 2.5).toFixed(2);
  const lon = (-180 + cj * 6 + 3).toFixed(2);
  return reply(
    await firstOk([`${LOL}/lat/${lat}/lon/${lon}/dist/250`, `${FI}/v3/lat/${lat}/lon/${lon}/dist/250`]),
    4,
  );
}
