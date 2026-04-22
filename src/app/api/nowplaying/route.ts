import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BBC_SERVICES: Record<string, string> = {
  "f-bbc1": "bbc_radio_one",
  "f-bbc2": "bbc_radio_two",
  "f-bbc3": "bbc_radio_three",
  "f-bbc4": "bbc_radio_fourfm",
  "f-bbc5": "bbc_radio_five_live",
  "f-bbc6": "bbc_6music",
};

async function fetchBbc(serviceId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://rms.api.bbc.co.uk/v2/services/${serviceId}/segments/latest`,
      { headers: { "User-Agent": "LaneyWeb/1.0" }, cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const seg = data.data?.[0];
    if (!seg) return null;
    const primary   = seg.titles?.primary   as string | undefined;
    const secondary = seg.titles?.secondary as string | undefined;
    if (primary && secondary) return `${secondary} – ${primary}`;
    return primary ?? null;
  } catch { return null; }
}

async function fetchIcy(streamUrl: string): Promise<string | null> {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(streamUrl, {
      headers: { "Icy-MetaData": "1", "User-Agent": "LaneyWeb/1.0" },
      signal: controller.signal,
    });

    const metaint = parseInt(res.headers.get("icy-metaint") ?? "0");
    if (!metaint || !res.body) return null;

    // Read just enough bytes to reach first metadata block
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    const needed = metaint + 1 + 255 * 16;

    try {
      while (total < needed) {
        const { done, value } = await reader.read();
        if (done || !value) break;
        chunks.push(value);
        total += value.length;
      }
    } finally {
      reader.cancel().catch(() => {});
    }

    const buf = new Uint8Array(total);
    let off = 0;
    for (const c of chunks) { buf.set(c, off); off += c.length; }

    if (buf.length <= metaint) return null;
    const metaLen = buf[metaint] * 16;
    if (!metaLen) return null;

    const raw = new TextDecoder().decode(buf.slice(metaint + 1, metaint + 1 + metaLen));
    const m = raw.match(/StreamTitle='([^']*)'/);
    return m?.[1] || null;
  } catch { return null; }
  finally { clearTimeout(tid); }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stationId = searchParams.get("stationId") ?? "";
  const streamUrl = searchParams.get("url") ?? "";

  let nowPlaying: string | null = null;

  const bbcService = BBC_SERVICES[stationId];
  if (bbcService) {
    nowPlaying = await fetchBbc(bbcService);
  } else if (streamUrl) {
    nowPlaying = await fetchIcy(streamUrl);
  }

  return NextResponse.json({ nowPlaying, timestamp: Date.now() });
}
