import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// UK petrol prices from gov.uk BEIS weekly road fuel prices
// https://www.gov.uk/government/statistical-data-sets/oil-and-petroleum-products-weekly-statistics
// CPI data from ONS
// Exchange rates from exchangerate-api (no key, limited)

async function fetchFuelPrices() {
  try {
    // BEIS weekly road fuel prices CSV
    const res = await fetch(
      "https://assets.publishing.service.gov.uk/media/weekly-road-fuel-prices.csv",
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const text = await res.text();
    const lines = text.trim().split("\n").filter(Boolean);
    // Last row = most recent week
    const last = lines[lines.length - 1].split(",");
    const headers = lines[0].split(",");
    const dateIdx = headers.findIndex((h) => h.toLowerCase().includes("date"));
    const unleadedIdx = headers.findIndex((h) => h.toLowerCase().includes("unleaded") || h.toLowerCase().includes("petrol"));
    const dieselIdx = headers.findIndex((h) => h.toLowerCase().includes("diesel"));
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
