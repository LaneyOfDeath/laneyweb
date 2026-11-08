import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Oldham Council bin collection lookup (portal.oldham.gov.uk).
const BASE = "https://portal.oldham.gov.uk";
const HDR = { "User-Agent": "Mozilla/5.0 (LaneyWeb)" };

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function GET(req: NextRequest) {
  const postcode = req.nextUrl.searchParams.get("postcode")?.trim();
  const uprn = req.nextUrl.searchParams.get("uprn")?.trim();

  try {
    if (uprn) {
      if (!/^\d{6,14}$/.test(uprn)) return NextResponse.json({ error: "Bad property id" }, { status: 400 });
      const r = await fetch(`${BASE}/bincollectiondates/details?uprn=${uprn}`, { headers: HDR, cache: "no-store" });
      if (!r.ok) return NextResponse.json({ error: `Council site ${r.status}` }, { status: 502 });
      const html = await r.text();
      const bins: { bin: string; date: string }[] = [];
      const re = /<th[^>]*>\s*<b>([^<]+)<\/b>\s*<\/th>[\s\S]*?class="coltwo">\s*(\d{2})\/(\d{2})\/(\d{4})/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(html))) {
        bins.push({ bin: m[1].trim(), date: `${m[4]}-${m[3]}-${m[2]}` });
      }
      bins.sort((a, b) => a.date.localeCompare(b.date));
      return NextResponse.json({ bins });
    }

    if (postcode) {
      if (!/^[A-Za-z0-9 ]{5,8}$/.test(postcode)) return NextResponse.json({ error: "Bad postcode" }, { status: 400 });
      const r = await fetch(`${BASE}/Common/GetAddressList?term=${encodeURIComponent(postcode)}&type=Postcode`, {
        headers: HDR,
        cache: "no-store",
      });
      if (!r.ok) return NextResponse.json({ error: `Council site ${r.status}` }, { status: 502 });
      const list: any[] = await r.json();
      const addresses = list
        .filter((a) => a.UPRN)
        .map((a) => ({ uprn: String(a.UPRN), address: String(a.FULL_ADDRESS) }));
      return NextResponse.json({ addresses });
    }

    return NextResponse.json({ error: "Give a postcode or uprn" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
