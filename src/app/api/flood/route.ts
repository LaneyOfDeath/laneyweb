import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// UK flood warnings from Environment Agency real-time API (no key needed)
// https://environment.data.gov.uk/flood-monitoring/doc/reference

async function fetchFloodWarnings() {
  try {
    const res = await fetch(
      "https://environment.data.gov.uk/flood-monitoring/id/floods?min-severity=1",
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items ?? []).map((f: Record<string, unknown>) => ({
      id: f["@id"],
      description: f.description,
      severity: f.severity,
      severityLevel: f.severityLevel,
      message: f.message,
      county: f.floodArea ? (f.floodArea as Record<string, unknown>).county : null,
      riverOrSea: f.floodArea ? (f.floodArea as Record<string, unknown>).riverOrSea : null,
      timeRaised: f.timeRaised,
      timeMessageChanged: f.timeMessageChanged,
      lat: f.floodAreaID ? null : null,
    }));
  } catch { return []; }
}

async function fetchFloodStations() {
  try {
    // High-reading river gauge stations
    const res = await fetch(
      "https://environment.data.gov.uk/flood-monitoring/id/stations?status=Active&_limit=20&_sorted&parameter=level",
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items ?? []).slice(0, 20).map((s: Record<string, unknown>) => ({
      id: s["@id"],
      label: s.label,
      river: s.riverName,
      town: s.town,
      lat: s.lat,
      lon: s.long,
      status: s.status,
    }));
  } catch { return []; }
}

export async function GET() {
  const [warnings, stations] = await Promise.all([
    fetchFloodWarnings(),
    fetchFloodStations(),
  ]);

  return NextResponse.json({ warnings, stations, timestamp: Date.now() });
}
