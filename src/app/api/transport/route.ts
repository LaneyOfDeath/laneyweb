import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.tfl.gov.uk/Line/Mode/tube,overground,dlr,elizabeth-line,tram/Status",
      { headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" }, cache: "no-store" }
    );
    if (!res.ok) return NextResponse.json({ lines: [], timestamp: Date.now() });
    const data = await res.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lines = (data as any[]).map(l => ({
      id:   l.id   as string,
      name: l.name as string,
      mode: (l.modeName as string),
      statuses: (l.lineStatuses ?? []).map((s: {
        statusSeverity: number;
        statusSeverityDescription: string;
        reason?: string;
      }) => ({
        severity:    s.statusSeverity,
        description: s.statusSeverityDescription,
        reason:      s.reason ?? null,
      })),
    }));

    return NextResponse.json({ lines, timestamp: Date.now() });
  } catch {
    return NextResponse.json({ lines: [], timestamp: Date.now() });
  }
}
