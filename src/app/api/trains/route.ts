import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BASE = "https://api.rtt.io/api/v1/json";

function auth() {
  const user = process.env.RTT_USERNAME ?? "";
  const pass = process.env.RTT_PASSWORD ?? "";
  return "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const station = (searchParams.get("station") ?? "PAD").toUpperCase().slice(0, 4);
  const type    = searchParams.get("type") === "arrivals" ? "arrivals" : "departures";

  try {
    const res = await fetch(`${BASE}/station/${station}/${type}`, {
      headers: { Authorization: auth(), Accept: "application/json" },
      cache: "no-store",
    });

    if (res.status === 404) return NextResponse.json({ error: "Station not found", services: [] }, { status: 404 });
    if (!res.ok)            return NextResponse.json({ error: "RTT error", services: [] }, { status: res.status });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    const services  = (data.services ?? []).slice(0, 20).map((s: any) => {
      const loc    = type === "departures" ? s.locationDetail : s.locationDetail;
      const origin = s.locationDetail?.origin?.[0]?.description ?? "";
      const dest   = s.locationDetail?.destination?.[0]?.description ?? "";
      return {
        uid:            s.serviceUid,
        trainId:        s.trainIdentity ?? "",
        operator:       s.atocName ?? "",
        origin,
        destination:    dest,
        platform:       loc?.platform ?? null,
        booked:         type === "departures" ? loc?.gbttBookedDeparture : loc?.gbttBookedArrival,
        realtime:       type === "departures" ? loc?.realtimeDeparture   : loc?.realtimeArrival,
        cancelled:      loc?.cancelReasonCode != null,
        late:           loc?.realtimeGbttVariation ? parseInt(loc.realtimeGbttVariation) > 0 : false,
        variation:      loc?.realtimeGbttVariation ?? null,
        displayAs:      loc?.displayAs ?? "",
      };
    });

    return NextResponse.json({
      station:     data.location?.name ?? station,
      crs:         station,
      type,
      services,
      timestamp:   Date.now(),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch", services: [] }, { status: 500 });
  }
}
