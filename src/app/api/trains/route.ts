import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function minutesLate(aimed: string | null, expected: string | null): number | null {
  if (!aimed || !expected || aimed === expected) return null;
  const [ah, am] = aimed.split(":").map(Number);
  const [eh, em] = expected.split(":").map(Number);
  const diff = eh * 60 + em - (ah * 60 + am);
  return diff > 0 ? diff : null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const station = (searchParams.get("station") ?? "PAD").toUpperCase().slice(0, 4);
  const type    = searchParams.get("type") === "arrivals" ? "arrivals" : "departures";

  const appId  = process.env.TRANSPORTAPI_APP_ID  ?? "";
  const appKey = process.env.TRANSPORTAPI_APP_KEY ?? "";

  const url =
    `https://transportapi.com/v3/uk/train/station/${station}/live.json` +
    `?app_id=${appId}&app_key=${appKey}&darwin=true&train_status=passenger`;

  try {
    const res = await fetch(url, { cache: "no-store" });

    if (res.status === 404) return NextResponse.json({ error: "Station not found", services: [] }, { status: 404 });
    if (res.status === 403) return NextResponse.json({ error: "Invalid API credentials", services: [] }, { status: 403 });
    if (!res.ok)            return NextResponse.json({ error: `API error ${res.status}`, services: [] }, { status: res.status });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any[] = (type === "departures" ? data.departures?.all : data.arrivals?.all) ?? [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const services = raw.slice(0, 20).map((s: any) => {
      const booked   = type === "departures" ? s.aimed_departure_time    : s.aimed_arrival_time;
      const realtime = type === "departures" ? s.expected_departure_time : s.expected_arrival_time;
      const late     = minutesLate(booked, realtime);
      return {
        uid:         s.train_uid        ?? s.service ?? "",
        trainId:     s.service          ?? "",
        operator:    s.operator_name    ?? s.operator ?? "",
        origin:      s.origin_name      ?? "",
        destination: s.destination_name ?? "",
        platform:    s.platform ?? null,
        booked:      booked    ?? null,
        realtime:    realtime  ?? null,
        cancelled:   s.status === "CANCELLED",
        late:        (late ?? 0) > 0,
        variation:   late !== null ? String(late) : null,
        displayAs:   s.status ?? "",
      };
    });

    return NextResponse.json({
      station:   data.station_name ?? station,
      crs:       station,
      type,
      services,
      timestamp: Date.now(),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch train data", services: [] }, { status: 500 });
  }
}
