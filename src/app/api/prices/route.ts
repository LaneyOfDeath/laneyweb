import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// UK petrol prices from gov.uk BEIS weekly road fuel prices
// https://www.gov.uk/government/statistical-data-sets/oil-and-petroleum-products-weekly-statistics
// CPI data from ONS
// Exchange rates from exchangerate-api (no key, limited)

async function fetchFuelPrices() {
  try {
    // Scrape the stats page to get the current CSV URL (gov.uk uses content-hashed URLs that change on each upload)
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
    // Strip BOM from first header if present
    const headers = lines[0].replace(/^\uFEFF/, "").split(",");
    const dateIdx = headers.findIndex((h) => h.toLowerCase().includes("date"));
    // ULSP pump price is column 1, ULSD is column 2
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

export async function GET() {
  const [fuel, fx, crypto] = await Promise.all([
    fetchFuelPrices(),
    fetchExchangeRates(),
    fetchCryptoSpot(),
  ]);

  return NextResponse.json({ fuel, fx, crypto, timestamp: Date.now() });
}
