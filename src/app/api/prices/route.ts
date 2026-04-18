import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function fetchFuelPrices() {
  try {
    const statsPage = await fetch(
      "https://www.gov.uk/government/statistics/weekly-road-fuel-prices",
      { cache: "no-store" }
    );
    if (!statsPage.ok) return null;
    const html = await statsPage.text();
    const match = html.match(/https:\/\/assets\.publishing\.service\.gov\.uk\/media\/[a-f0-9]+\/[^"']+\.csv/i);
    if (!match) return null;
    const res = await fetch(match[0], { cache: "no-store" });
    if (!res.ok) return null;
    const text = await res.text();
    const lines = text.trim().split("\n").filter(Boolean);
    const last = lines[lines.length - 1].split(",");
    const headers = lines[0].replace(/^\uFEFF/, "").split(",");
    const dateIdx = headers.findIndex((h) => h.toLowerCase().includes("date"));
    const unleadedIdx = headers.findIndex((h) => h.toLowerCase().includes("ulsp") && h.toLowerCase().includes("pump"));
    const dieselIdx = headers.findIndex((h) => h.toLowerCase().includes("ulsd") && h.toLowerCase().includes("pump"));
    return {
      date: last[dateIdx >= 0 ? dateIdx : 0]?.replace(/"/g, "").trim(),
      unleaded: parseFloat(last[unleadedIdx >= 0 ? unleadedIdx : 1]) || null,
      diesel: parseFloat(last[dieselIdx >= 0 ? dieselIdx : 2]) || null,
    };
  } catch { return null; }
}

async function fetchExchangeRates() {
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/GBP", { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      USD: data.rates?.USD,
      EUR: data.rates?.EUR,
      JPY: data.rates?.JPY,
      AUD: data.rates?.AUD,
      CAD: data.rates?.CAD,
    };
  } catch { return null; }
}

async function fetchCryptoSpot() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=gbp&include_24hr_change=true",
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function fetchBoeRate() {
  try {
    const res = await fetch(
      "https://www.bankofengland.co.uk/boeapps/iadb/fromshowcolumns.asp?csv.x=yes&Datefrom=01/Jan/2025&Dateto=now&SeriesCodes=IUDBEDR&CSVF=TN&UsingCodes=Y",
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const text = await res.text();
    const lines = text.trim().split("\n").filter((l) => !l.startsWith("DATE") && Boolean(l));
    const last = lines[lines.length - 1]?.split(",");
    if (!last) return null;
    return {
      rate: parseFloat(last[1]) || null,
      date: last[0]?.trim(),
    };
  } catch { return null; }
}

async function fetchCpi() {
  try {
    const res = await fetch(
      "https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/d7g7/mm23/data",
      { cache: "no-store", headers: { Accept: "application/json" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const latest = data.months?.[data.months.length - 1];
    if (!latest) return null;
    return {
      rate: parseFloat(latest.value) || null,
      date: latest.date as string,
    };
  } catch { return null; }
}

async function fetchYahooRaw(symbol: string) {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`,
      { cache: "no-store", headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) return null;
    const price = meta.regularMarketPrice ?? 0;
    const prev = meta.previousClose ?? meta.chartPreviousClose ?? price;
    return { price, prev };
  } catch { return null; }
}

export async function GET() {
  const [fuel, fx, crypto, boe, cpi, rawGold, rawSilver, rawBrent] = await Promise.all([
    fetchFuelPrices(),
    fetchExchangeRates(),
    fetchCryptoSpot(),
    fetchBoeRate(),
    fetchCpi(),
    fetchYahooRaw("GC=F"),
    fetchYahooRaw("SI=F"),
    fetchYahooRaw("BZ=F"),
  ]);

  const usdPerGbp = fx?.USD ?? 1.27;
  const toGbp = (usd: number) => usd / usdPerGbp;
  const pct = (price: number, prev: number) => prev !== 0 ? ((price - prev) / prev) * 100 : 0;

  const commodities = {
    gold:   rawGold   ? { priceGbp: toGbp(rawGold.price),   changePercent: pct(rawGold.price,   rawGold.prev)   } : null,
    silver: rawSilver ? { priceGbp: toGbp(rawSilver.price), changePercent: pct(rawSilver.price, rawSilver.prev) } : null,
    brent:  rawBrent  ? { priceGbp: toGbp(rawBrent.price),  changePercent: pct(rawBrent.price,  rawBrent.prev)  } : null,
  };

  return NextResponse.json({ fuel, fx, crypto, boe, cpi, commodities, timestamp: Date.now() });
}
