"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Search, LocateFixed, Crosshair, Link2, X, ArrowUp, ArrowDown, Minus } from "lucide-react";
import "./planes.css";
import {
  PlaneStore, Plane, Mode, Filter, Band, WirePlane,
  altColor, passes, phase, distNm, bearing, EMERGENCY_SQUAWKS,
} from "./store";
import { AIRPORT_GROUPS, AIRLINES, airlineOf } from "./data";
import type { View, Feed, FlyTo, RouteLine } from "./PlanesMap";

const PlanesMap = dynamic(() => import("./PlanesMap"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "grid", placeItems: "center", color: "#92a0c8" }}>Loading the map...</div>
  ),
});

interface DbAirport { iata_code: string; icao_code: string; name: string; municipality: string; country_name: string; latitude: number; longitude: number }
interface DbRoute { airline?: { name: string } | null; origin: DbAirport; destination: DbAirport }
interface DbAircraft { type?: string; manufacturer?: string; registered_owner?: string; registered_owner_country_name?: string; url_photo_thumbnail?: string | null }
interface Photo { src: string; link?: string; by?: string }
interface Info { hex: string; aircraft?: DbAircraft; route?: DbRoute; photo?: Photo }

const DEFAULT_VIEW = { lat: 53.45, lon: -2.3, zoom: 8 };
const COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const compass = (deg: number) => COMPASS[Math.round(deg / 45) % 8];
const ft = (n: number) => `${Math.round(n).toLocaleString()} ft`;

function loadView() {
  try {
    const v = JSON.parse(localStorage.getItem("planes.view") ?? "null");
    if (v && isFinite(v.lat) && isFinite(v.lon) && isFinite(v.zoom)) return v as typeof DEFAULT_VIEW;
  } catch {}
  return DEFAULT_VIEW;
}

function duration(mins: number) {
  if (mins < 60) return `${Math.max(1, Math.round(mins))} min`;
  return `${Math.floor(mins / 60)} h ${Math.round(mins % 60)} min`;
}

export default function PlanesDashboard() {
  const [store] = useState(() => new PlaneStore());
  const [initial] = useState(() => (typeof window === "undefined" ? DEFAULT_VIEW : loadView()));
  const [mode, setMode] = useState<Mode>("live");
  const [filter, setFilter] = useState<Filter>({ ground: false, band: "all", labels: true });
  const [selected, setSelected] = useState<string | null>(null);
  const [follow, setFollow] = useState(false);
  const [home, setHome] = useState<[number, number] | null>(null);
  const [flyTo, setFlyTo] = useState<FlyTo | null>(null);
  const [view, setView] = useState<View | null>(null);
  const [feed, setFeed] = useState<Feed | null>(null);
  const [tick, setTick] = useState(0);
  const [info, setInfo] = useState<Info | null>(null);
  const [query, setQuery] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const go = useCallback((lat: number, lon: number, zoom?: number) => {
    setFlyTo({ lat, lon, zoom, n: Date.now() });
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const find = useCallback(async (q: string) => {
    const term = q.trim();
    if (term.length < 2) return;
    setNote("Searching...");
    try {
      const res = await fetch(`/api/planes?find=${encodeURIComponent(term)}`);
      const j: { ac?: WirePlane[] } = await res.json();
      if (!res.ok) { setNote("Feed is busy, try again in a moment."); return; }
      const hit = j.ac?.[0];
      if (!hit) { setNote(`"${term.toUpperCase()}" is not being tracked right now.`); return; }
      store.ingest(j.ac ?? []);
      setMode("live");
      setFilter((f) => ({ ...f, band: "all", ground: f.ground || hit.g === 1 }));
      setSelected(hit.h);
      setFollow(false);
      go(hit.la, hit.lo, 9);
      setNote(null);
    } catch {
      setNote("Search failed, try again.");
    }
  }, [store, go]);

  // Saved home spot and ?hex= deep link
  useEffect(() => {
    try {
      const h = JSON.parse(localStorage.getItem("planes.home") ?? "null");
      if (Array.isArray(h) && h.length === 2) setHome([h[0], h[1]]);
    } catch {}
    const hex = new URLSearchParams(window.location.search).get("hex");
    if (hex) find(hex);
  }, [find]);

  // Look up who and what the selected aircraft is (free public databases, straight from the browser)
  useEffect(() => {
    if (!selected) { setInfo(null); return; }
    let dead = false;
    const hex = selected;
    setInfo({ hex });
    const patch = (p: Partial<Info>) => { if (!dead) setInfo((i) => (i && i.hex === hex ? { ...i, ...p } : i)); };
    const get = async (url: string) => {
      try {
        const r = await fetch(url);
        return r.ok ? await r.json() : null;
      } catch { return null; }
    };
    if (/^[0-9a-f]{6}$/.test(hex)) {
      get(`https://api.adsbdb.com/v0/aircraft/${hex}`).then((j) => {
        if (j?.response?.aircraft) patch({ aircraft: j.response.aircraft });
      });
      get(`https://api.planespotters.net/pub/photos/hex/${hex}`).then((j) => {
        const ph = j?.photos?.[0];
        if (ph) patch({ photo: { src: ph.thumbnail_large?.src ?? ph.thumbnail?.src, link: ph.link, by: ph.photographer } });
      });
    }
    const cs = store.planes.get(hex)?.f;
    if (cs && /^[A-Z]{2,3}\d/.test(cs)) {
      get(`https://api.adsbdb.com/v0/callsign/${cs}`).then((j) => {
        if (j?.response?.flightroute?.origin) patch({ route: j.response.flightroute });
      });
    }
    return () => { dead = true; };
  }, [selected, store]);

  const sel = selected ? store.planes.get(selected) ?? null : null;

  // Is the listed route believable for where the aircraft actually is?
  const routeState = useMemo(() => {
    const r = info?.route;
    if (!r || !sel) return null;
    const [la, lo] = store.pos(sel, Date.now());
    const total = distNm(r.origin.latitude, r.origin.longitude, r.destination.latitude, r.destination.longitude);
    const done = distNm(r.origin.latitude, r.origin.longitude, la, lo);
    const left = distNm(la, lo, r.destination.latitude, r.destination.longitude);
    const plausible = done + left <= total * 1.25 + 150;
    return { r, total, done, left, plausible, pct: Math.max(0, Math.min(100, (done / Math.max(1, done + left)) * 100)) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info?.route, sel, tick]);

  const routeLine: RouteLine | null = useMemo(() => {
    const r = routeState?.plausible ? routeState.r : null;
    if (!r) return null;
    return {
      o: { lat: r.origin.latitude, lon: r.origin.longitude, code: r.origin.iata_code || r.origin.icao_code },
      d: { lat: r.destination.latitude, lon: r.destination.longitude, code: r.destination.iata_code || r.destination.icao_code },
    };
  }, [routeState?.plausible, routeState?.r]);

  // What is in view right now
  const snap = useMemo(() => {
    const now = Date.now();
    const ref: [number, number] | null = view
      ? home && home[0] > view.s && home[0] < view.n && home[1] > view.w && home[1] < view.e
        ? home
        : [view.lat, view.lon]
      : null;
    let airborne = 0, ground = 0, dep = 0, arr = 0;
    let highest: Plane | null = null, fastest: Plane | null = null;
    const airlines = new Map<string, number>();
    const emergencies: Plane[] = [];
    const list: { p: Plane; d: number; b: number }[] = [];
    for (const p of store.planes.values()) {
      const [la, lo] = store.pos(p, now);
      if (view && mode === "live" && (la < view.s || la > view.n || lo < view.w || lo > view.e)) continue;
      if (p.sq && p.sq in EMERGENCY_SQUAWKS) emergencies.push(p);
      if (p.g) { if ((p.c ?? "")[0] !== "C") ground++; }
      else {
        airborne++;
        const a = p.a ?? 0, vr = p.vr ?? 0;
        if (a < 15000 && vr > 500) dep++;
        if (a < 15000 && vr < -500) arr++;
        if (!highest || a > (highest.a ?? 0)) highest = p;
        if (!fastest || (p.s ?? 0) > (fastest.s ?? 0)) fastest = p;
        if (p.f && /^[A-Z]{3}\d/.test(p.f)) airlines.set(p.f.slice(0, 3), (airlines.get(p.f.slice(0, 3)) ?? 0) + 1);
      }
      if (passes(p, mode, filter) && ref) list.push({ p, d: distNm(ref[0], ref[1], la, lo), b: bearing(ref[0], ref[1], la, lo) });
    }
    list.sort((x, y) => x.d - y.d);
    const top = [...airlines.entries()].sort((x, y) => y[1] - x[1]).slice(0, 5);
    return { airborne, ground, dep, arr, highest, fastest, top, emergencies, shown: list.length, list: list.slice(0, 40), fromHome: ref === home && !!home };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, view, mode, filter, home, store]);

  const pick = (h: string | null) => { setSelected(h); if (!h) setFollow(false); };

  const locate = () => {
    if (!navigator.geolocation) { setNote("This browser will not share a location."); return; }
    setNote("Finding you...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const h: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setHome(h);
        try { localStorage.setItem("planes.home", JSON.stringify(h)); } catch {}
        setMode("live");
        go(h[0], h[1], 10);
        setNote(null);
      },
      () => setNote("Location was blocked. Allow it in the browser to use Overhead."),
      { enableHighAccuracy: false, timeout: 10000 },
    );
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setNote(null);
    pick(null);
    if (m !== "live" && view) go(view.lat, view.lon, 4);
  };

  const share = async () => {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/planes?hex=${selected}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const label = (p: Plane) => p.f || p.r || p.h.toUpperCase();

  return (
    <div className="planes">
      <div className="pl-bar">
        <h1 className="pl-title">Planes</h1>

        <form className="pl-search" onSubmit={(e) => { e.preventDefault(); find(query); }}>
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Flight, reg or hex code"
            aria-label="Find an aircraft by flight number, registration or hex code"
          />
        </form>

        <button className="pl-btn" onClick={locate} title="Centre on where you are and list what is overhead">
          <LocateFixed size={15} /> Overhead
        </button>

        <select
          className="pl-select"
          value=""
          aria-label="Go to an airport"
          onChange={(e) => {
            const a = AIRPORT_GROUPS.flatMap((g) => g.airports).find((x) => x.code === e.target.value);
            if (a) { setMode("live"); go(a.lat, a.lon, 10); }
          }}
        >
          <option value="">Go to airport</option>
          {AIRPORT_GROUPS.map((g) => (
            <optgroup key={g.group} label={g.group}>
              {g.airports.map((a) => <option key={a.code} value={a.code}>{a.code} {a.name}</option>)}
            </optgroup>
          ))}
        </select>

        <div className="pl-seg" role="group" aria-label="What to show">
          <button className="pl-btn" aria-pressed={mode === "live"} onClick={() => switchMode("live")}>Everything</button>
          <button className="pl-btn" aria-pressed={mode === "mil"} onClick={() => switchMode("mil")} title="Every military aircraft being tracked worldwide">Military</button>
          <button className="pl-btn" aria-pressed={mode === "emergency"} onClick={() => switchMode("emergency")} title="Aircraft squawking 7700, 7600 or 7500 anywhere in the world">Emergencies</button>
        </div>

        {mode === "live" && (
          <>
            <select
              className="pl-select"
              value={filter.band}
              aria-label="Height filter"
              onChange={(e) => setFilter((f) => ({ ...f, band: e.target.value as Band }))}
            >
              <option value="all">All heights</option>
              <option value="low">Below 10,000 ft</option>
              <option value="mid">10,000 to 30,000 ft</option>
              <option value="high">Above 30,000 ft</option>
            </select>
            <button className="pl-btn" aria-pressed={filter.ground} onClick={() => setFilter((f) => ({ ...f, ground: !f.ground }))}>On the ground</button>
            <button className="pl-btn" aria-pressed={filter.labels} onClick={() => setFilter((f) => ({ ...f, labels: !f.labels }))}>Names</button>
          </>
        )}

        {feed && !feed.ok ? (
          <span className="pl-count is-bad">Feed is busy, retrying</span>
        ) : (
          <span className="pl-count">
            <b>{snap.shown.toLocaleString()}</b> aircraft{feed?.src ? ` from ${feed.src.replace(/^(api|opendata)\./, "")}` : ""}
          </span>
        )}
      </div>

      <div className="pl-body">
        <div className="pl-map">
          <PlanesMap
            store={store} mode={mode} filter={filter} selected={selected} follow={follow}
            route={routeLine} home={home} flyTo={flyTo} initial={initial}
            onSelect={pick} onView={setView} onFeed={setFeed}
          />
          {(note || (mode === "live" && feed?.capped)) && (
            <div className="pl-note" role="status">
              {note ?? "Zoomed out, so only traffic near the centre is shown. Zoom in to see everything."}
            </div>
          )}
          <div className="pl-legend" aria-label="Colour shows height">
            <div className="pl-ramp" />
            <div><span>Ground</span><span>20,000 ft</span><span>40,000</span></div>
          </div>
        </div>

        <div className="pl-panel">
          {sel ? (
            <Detail
              p={sel} info={info} routeState={routeState} home={home} store={store}
              follow={follow} copied={copied}
              onFollow={() => setFollow((f) => !f)} onShare={share} onClose={() => pick(null)}
            />
          ) : (
            <>
              {snap.emergencies.length > 0 && (
                <div className="pl-alarm">
                  <p>Emergency code in use</p>
                  {snap.emergencies.map((p) => (
                    <button key={p.h} onClick={() => { pick(p.h); go(p.la, p.lo); }}>
                      {label(p)}, {p.sq} {EMERGENCY_SQUAWKS[p.sq!].toLowerCase()}
                    </button>
                  ))}
                </div>
              )}

              {mode === "live" ? (
                <>
                  <h2 className="pl-h">On the map now</h2>
                  <div className="pl-counts">
                    <div><strong>{snap.airborne.toLocaleString()}</strong><span>flying</span></div>
                    <div><strong>{snap.ground.toLocaleString()}</strong><span>on the ground</span></div>
                    <div><strong>{snap.dep.toLocaleString()}</strong><span>climbing out</span></div>
                    <div><strong>{snap.arr.toLocaleString()}</strong><span>coming in</span></div>
                  </div>
                  {snap.arr >= 12 && snap.dep === 0 && (
                    <p className="pl-hint">Planes are landing but none are climbing out. It may be a quiet spell, or departures are being held.</p>
                  )}
                  <div className="pl-facts">
                    {snap.highest && (
                      <button onClick={() => pick(snap.highest!.h)}>
                        <span>Highest</span><span>{label(snap.highest)} at {ft(snap.highest.a ?? 0)}</span>
                      </button>
                    )}
                    {snap.fastest && (
                      <button onClick={() => pick(snap.fastest!.h)}>
                        <span>Fastest</span><span>{label(snap.fastest)} at {Math.round(snap.fastest.s ?? 0)} kt</span>
                      </button>
                    )}
                  </div>
                  {snap.top.length > 0 && (
                    <div className="pl-airlines">
                      {snap.top.map(([code, n]) => (
                        <Fragment key={code}>
                          <span>{AIRLINES[code] ?? code}</span>
                          <i style={{ width: `${(n / snap.top[0][1]) * 100}%` }} />
                          <b>{n}</b>
                        </Fragment>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h2 className="pl-h">{mode === "mil" ? "Military aircraft worldwide" : "Emergencies worldwide"}</h2>
                  <p className="pl-text">
                    {mode === "mil"
                      ? "Every military aircraft the receiver network can see. Many fly with tracking switched off, so this is never the full picture."
                      : snap.shown
                        ? "Aircraft sending an emergency code right now."
                        : "No aircraft is sending 7700, 7600 or 7500 right now."}
                  </p>
                </>
              )}

              <h2 className="pl-h">
                {mode === "live" ? (snap.fromHome ? "Nearest to you" : "Nearest to the middle of the map") : "Tracked now"}
              </h2>
              {snap.list.map(({ p, d, b }) => (
                <button key={p.h} className="pl-row" onClick={() => pick(p.h)}>
                  <i style={{ background: altColor(p) }} />
                  <span>
                    <strong>{label(p)}</strong>
                    <small>{[airlineOf(p.f), p.t].filter(Boolean).join(", ") || p.r || "Type not known"}</small>
                  </span>
                  <span>
                    <b>{p.g ? "On ground" : ft(p.a ?? 0)}</b>
                    <small>{d < 10 ? d.toFixed(1) : Math.round(d)} nm {compass(b)}</small>
                  </span>
                </button>
              ))}
              {!snap.list.length && mode === "live" && (
                <p className="pl-text">{feed ? "Nothing here with these filters. Try All heights, or move the map." : "Loading aircraft..."}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface RouteState { r: DbRoute; total: number; done: number; left: number; plausible: boolean; pct: number }

function Detail({
  p, info, routeState, home, store, follow, copied, onFollow, onShare, onClose,
}: {
  p: Plane; info: Info | null; routeState: RouteState | null; home: [number, number] | null; store: PlaneStore;
  follow: boolean; copied: boolean; onFollow: () => void; onShare: () => void; onClose: () => void;
}) {
  const ac = info?.aircraft;
  const photo = info?.photo ?? (ac?.url_photo_thumbnail ? { src: ac.url_photo_thumbnail } : null);
  const vr = p.vr ?? 0;
  const [la, lo] = store.pos(p, Date.now());
  const age = Math.max(0, Math.round((Date.now() - p.ts) / 1000));
  const emergency = p.sq && p.sq in EMERGENCY_SQUAWKS ? EMERGENCY_SQUAWKS[p.sq] : null;
  const operator = routeState?.r.airline?.name ?? airlineOf(p.f) ?? ac?.registered_owner ?? (p.m ? "Military" : "Private or unknown");
  const eta = routeState?.plausible && !p.g && (p.s ?? 0) > 120 ? (routeState.left / (p.s as number)) * 60 : null;
  const typeName = ac ? [ac.manufacturer, ac.type].filter(Boolean).join(" ") : p.d;

  const rows: [string, string][] = [];
  rows.push(["Height", p.g ? "On the ground" : ft(p.a ?? 0)]);
  if (!p.g && p.na != null && Math.abs(p.na - (p.a ?? 0)) > 300) rows.push(["Heading for", ft(p.na)]);
  if (p.s != null) rows.push(["Speed over ground", `${Math.round(p.s)} kt (${Math.round(p.s * 1.15078)} mph)`]);
  if (p.ias != null || p.mach != null) rows.push(["Airspeed", [p.ias != null ? `${Math.round(p.ias)} kt` : null, p.mach != null ? `Mach ${p.mach.toFixed(2)}` : null].filter(Boolean).join(", ")]);
  if (p.tr != null) rows.push(["Direction", `${Math.round(p.tr)}° ${compass(p.tr)}`]);
  if (p.ws != null && p.wd != null) rows.push(["Wind at that height", `${Math.round(p.ws)} kt from ${Math.round(p.wd)}°`]);
  if (p.oat != null) rows.push(["Air outside", `${Math.round(p.oat)}°C`]);
  if (typeName) rows.push(["Aircraft", typeName]);
  if (ac?.registered_owner_country_name) rows.push(["Registered in", ac.registered_owner_country_name]);
  if (p.sq) rows.push(["Squawk code", p.sq]);
  if (home) rows.push(["From you", `${distNm(home[0], home[1], la, lo).toFixed(1)} nm ${compass(bearing(home[0], home[1], la, lo))}`]);
  rows.push(["Last heard", age < 2 ? "just now" : `${age} s ago`]);

  return (
    <div>
      {photo?.src && (
        <div className="pl-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.src} alt={`Photo of ${p.r ?? "this aircraft"}`} />
          {photo.by && <a href={photo.link} target="_blank" rel="noreferrer">© {photo.by}, planespotters.net</a>}
        </div>
      )}

      <div className={emergency ? "pl-strip is-alarm" : "pl-strip"}>
        <div>
          <strong>{p.f || p.r || p.h.toUpperCase()}</strong>
          <small>{operator}</small>
        </div>
        <div className="is-mid">
          <strong>{p.t ?? "?"}</strong>
          <small>{p.r ?? "No reg"}</small>
        </div>
        <div className={routeState && !routeState.plausible ? "is-mid is-stale" : "is-mid"}>
          {routeState ? (
            <>
              <strong>{routeState.r.origin.iata_code || routeState.r.origin.icao_code} {routeState.r.destination.iata_code || routeState.r.destination.icao_code}</strong>
              <small>{routeState.r.origin.municipality} to {routeState.r.destination.municipality}</small>
            </>
          ) : (
            <>
              <strong>{p.g ? "GND" : `FL${String(Math.round((p.a ?? 0) / 100)).padStart(3, "0")}`}</strong>
              <small>Route not known</small>
            </>
          )}
        </div>
        <button className="pl-close" onClick={onClose} aria-label="Close this aircraft"><X size={14} /></button>
      </div>

      {emergency && <div className="pl-banner">Sending {p.sq}: {emergency.toLowerCase()}</div>}

      {routeState && (
        <div className="pl-trip">
          {routeState.plausible ? (
            <>
              <div className="pl-line"><i style={{ width: `${routeState.pct}%` }} /></div>
              <p>{Math.round(routeState.left).toLocaleString()} nm to go{eta != null ? `, about ${duration(eta)} at this speed` : ""}</p>
            </>
          ) : (
            <p className="is-warn">That is the usual route for this flight number, but the aircraft is nowhere near it, so today&apos;s flight is probably different.</p>
          )}
        </div>
      )}

      <div className="pl-state">
        {vr > 400 ? <ArrowUp size={16} color="#7be3a4" /> : vr < -400 ? <ArrowDown size={16} color="#ffb23e" /> : <Minus size={16} color="#92a0c8" />}
        {phase(p)}
        {!p.g && Math.abs(vr) > 400 && <span>{vr > 0 ? "+" : ""}{Math.round(vr).toLocaleString()} ft a minute</span>}
      </div>

      <dl className="pl-read">
        {rows.map(([k, v]) => (
          <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
        ))}
      </dl>

      <div className="pl-actions">
        <button className="pl-btn" aria-pressed={follow} onClick={onFollow}><Crosshair size={15} /> {follow ? "Following" : "Follow"}</button>
        <button className="pl-btn" onClick={onShare}><Link2 size={15} /> {copied ? "Link copied" : "Copy link"}</button>
      </div>
    </div>
  );
}
