import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Xbox Game Pass lists (public "sigl" lists used by xbox.com) + Microsoft display catalog for titles/art.
const SIGLS = {
  coming: "095bda36-f5cd-43f2-9ee1-0a72f371fb96",
  added: "f13cf6b4-57e6-4459-89df-6aec18cf0538",
  leaving: "393f05bf-e596-4ef6-9487-6d4fa0eab987",
};
const UA = "LaneyWeb/1.0 (+https://laneyweb.vercel.app)";

/* eslint-disable @typescript-eslint/no-explicit-any */
async function sigl(id: string): Promise<string[]> {
  const r = await fetch(`https://catalog.gamepass.com/sigls/v2?id=${id}&language=en-gb&market=GB`, {
    headers: { "User-Agent": UA },
    next: { revalidate: 3600 },
  });
  if (!r.ok) return [];
  const d: any[] = await r.json();
  return d.filter((x) => x.id).map((x) => x.id);
}

async function titles(ids: string[]) {
  if (!ids.length) return [];
  const out: { id: string; title: string; image: string | null }[] = [];
  for (let i = 0; i < ids.length; i += 20) {
    const chunk = ids.slice(i, i + 20);
    const r = await fetch(
      `https://displaycatalog.mp.microsoft.com/v7.0/products?bigIds=${chunk.join(",")}&market=GB&languages=en-gb`,
      { headers: { "User-Agent": UA }, next: { revalidate: 3600 } }
    );
    if (!r.ok) continue;
    const d = await r.json();
    for (const p of d.Products ?? []) {
      const lp = p.LocalizedProperties?.[0];
      const img =
        lp?.Images?.find((i: any) => i.ImagePurpose === "Poster") ??
        lp?.Images?.find((i: any) => i.ImagePurpose === "BoxArt") ??
        null;
      out.push({
        id: p.ProductId,
        title: lp?.ProductTitle ?? p.ProductId,
        image: img ? `https:${img.Uri}?w=180` : null,
      });
    }
  }
  // keep list order
  return ids.map((id) => out.find((o) => o.id === id)).filter(Boolean);
}

async function deals() {
  const r = await fetch(
    "https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=12&sortBy=Deal%20Rating&onSale=1",
    { headers: { "User-Agent": UA }, next: { revalidate: 1800 } }
  );
  if (!r.ok) return [];
  const d: any[] = await r.json();
  return d.map((x) => ({
    title: x.title,
    sale: Number(x.salePrice),
    normal: Number(x.normalPrice),
    savings: Math.round(Number(x.savings)),
    thumb: x.thumb,
    url: `https://www.cheapshark.com/redirect?dealID=${x.dealID}`,
  }));
}

export async function GET() {
  try {
    const [coming, added, leaving, steam] = await Promise.all([
      sigl(SIGLS.coming).then((ids) => titles(ids.slice(0, 16))),
      sigl(SIGLS.added).then((ids) => titles(ids.slice(0, 16))),
      sigl(SIGLS.leaving).then((ids) => titles(ids.slice(0, 16))),
      deals().catch(() => []),
    ]);
    return NextResponse.json({ coming, added, leaving, steam, updated: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
