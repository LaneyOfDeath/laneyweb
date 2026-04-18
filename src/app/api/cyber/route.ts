import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "60"), 200);

  try {
    const res = await fetch(
      "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return NextResponse.json({ vulnerabilities: [], count: 0, timestamp: Date.now() });
    const data = await res.json();

    const vulnerabilities = (data.vulnerabilities ?? [])
      .slice(-limit)
      .reverse()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((v: any) => ({
        cveId:       v.cveID           as string,
        vendor:      v.vendorProject   as string,
        product:     v.product         as string,
        name:        v.vulnerabilityName as string,
        dateAdded:   v.dateAdded       as string,
        description: v.shortDescription as string,
        action:      v.requiredAction  as string,
        dueDate:     v.dueDate         as string,
      }));

    return NextResponse.json({
      vulnerabilities,
      count:          data.count          ?? 0,
      catalogVersion: data.catalogVersion ?? "",
      dateReleased:   data.dateReleased   ?? "",
      timestamp: Date.now(),
    });
  } catch {
    return NextResponse.json({ vulnerabilities: [], count: 0, timestamp: Date.now() });
  }
}
