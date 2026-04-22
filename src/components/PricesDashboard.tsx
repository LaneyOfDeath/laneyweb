"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, TrendingUp, TrendingDown, Fuel, DollarSign, Landmark, BarChart2 } from "lucide-react";
import LiveTimestamp from "@/components/LiveTimestamp";

interface FuelData { date: string; unleaded: number | null; diesel: number | null; }
interface FXData { USD: number; EUR: number; JPY: number; AUD: number; CAD: number; }
interface BoeData { rate: number | null; date: string; }
interface CpiData { rate: number | null; date: string; }
interface CommodityItem { priceGbp: number; changePercent: number; }
interface CommoditiesData {
  gold: CommodityItem | null;
  silver: CommodityItem | null;
  brent: CommodityItem | null;
}

interface PricesResponse {
  fuel: FuelData | null;
  fx: FXData | null;
  boe: BoeData | null;
  cpi: CpiData | null;
  commodities: CommoditiesData | null;
  timestamp: number;
}

function StatRow({ label, value, sub, change }: { label: string; value: string; sub?: string; change?: number }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e2a3a]/60 hover:bg-white/5">
      <div>
        <p className="text-xs text-white font-medium">{label}</p>
        {sub && <p className="text-[10px] text-[#64748b] mt-0.5">{sub}</p>}
      </div>
      <div className="text-right">
        <p className="text-xs font-semibold text-white">{value}</p>
        {change !== undefined && (
          <p className={`text-[10px] flex items-center gap-0.5 justify-end mt-0.5 ${change >= 0 ? "text-green-400" : "text-red-400"}`}>
            {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change >= 0 ? "+" : ""}{change.toFixed(2)}%
          </p>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, color }: { icon: React.ElementType; title: string; color: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-[#1e2a3a] bg-white/2">
      <Icon className={`w-3 h-3 ${color}`} />
      <span className={`text-[10px] font-semibold uppercase tracking-widest ${color}`}>{title}</span>
    </div>
  );
}

export default function PricesDashboard() {
  const [data, setData] = useState<PricesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/prices");
      const json = await res.json();
      setData(json);
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2a3a]">
        <p className="text-xs text-[#64748b]">UK fuel, economy, exchange rates & commodities</p>
        <div className="flex items-center gap-3 text-xs text-[#64748b]">
          {lastUpdate && <LiveTimestamp date={lastUpdate} />}
          <button onClick={fetchData} disabled={loading}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#94a3b8] hover:text-white transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {!data ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="w-6 h-6 text-[#64748b] animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 h-full">

            {/* Left column */}
            <div className="flex flex-col gap-3">
              {/* UK Economy */}
              <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] overflow-hidden">
                <SectionHeader icon={Landmark} title="UK Economy" color="text-sky-400" />
                {data.boe ? (
                  <StatRow
                    label="Bank of England Base Rate"
                    value={data.boe.rate != null ? `${data.boe.rate.toFixed(2)}%` : "N/A"}
                    sub={`Effective ${data.boe.date}`}
                  />
                ) : (
                  <p className="px-3 py-2 text-xs text-[#64748b] border-b border-[#1e2a3a]/60">BoE rate unavailable</p>
                )}
                {data.cpi ? (
                  <StatRow
                    label="CPI Inflation (Annual)"
                    value={data.cpi.rate != null ? `${data.cpi.rate.toFixed(1)}%` : "N/A"}
                    sub={`${data.cpi.date} · ONS`}
                  />
                ) : (
                  <p className="px-3 py-2 text-xs text-[#64748b]">CPI data unavailable</p>
                )}
              </div>

              {/* Fuel Prices */}
              <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] overflow-hidden">
                <SectionHeader icon={Fuel} title="UK Pump Prices (p/litre)" color="text-orange-400" />
                {data.fuel ? (
                  <>
                    <StatRow label="Unleaded (E10)" value={data.fuel.unleaded ? `${data.fuel.unleaded.toFixed(1)}p` : "N/A"} sub={`Week of ${data.fuel.date}`} />
                    <StatRow label="Diesel" value={data.fuel.diesel ? `${data.fuel.diesel.toFixed(1)}p` : "N/A"} sub="gov.uk BEIS" />
                  </>
                ) : (
                  <p className="px-3 py-2 text-xs text-[#64748b]">Fuel data unavailable</p>
                )}
              </div>

              {/* Commodities */}
              <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] overflow-hidden">
                <SectionHeader icon={BarChart2} title="Commodities (GBP)" color="text-amber-400" />
                {data.commodities?.gold ? (
                  <StatRow
                    label="Gold"
                    value={`£${data.commodities.gold.priceGbp.toLocaleString("en-GB", { maximumFractionDigits: 0 })}/oz`}
                    change={data.commodities.gold.changePercent}
                    sub="XAU · 24h"
                  />
                ) : <p className="px-3 py-2 text-xs text-[#64748b] border-b border-[#1e2a3a]/60">Gold unavailable</p>}
                {data.commodities?.silver ? (
                  <StatRow
                    label="Silver"
                    value={`£${data.commodities.silver.priceGbp.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/oz`}
                    change={data.commodities.silver.changePercent}
                    sub="XAG · 24h"
                  />
                ) : <p className="px-3 py-2 text-xs text-[#64748b] border-b border-[#1e2a3a]/60">Silver unavailable</p>}
                {data.commodities?.brent ? (
                  <StatRow
                    label="Brent Crude"
                    value={`£${data.commodities.brent.priceGbp.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/bbl`}
                    change={data.commodities.brent.changePercent}
                    sub="BZ=F · 24h"
                  />
                ) : <p className="px-3 py-2 text-xs text-[#64748b]">Brent unavailable</p>}
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-3">
              {/* Exchange Rates */}
              <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] overflow-hidden">
                <SectionHeader icon={DollarSign} title="Exchange Rates (1 GBP =)" color="text-emerald-400" />
                {data.fx ? (
                  <>
                    <StatRow label="US Dollar" value={`$${data.fx.USD?.toFixed(4)}`} />
                    <StatRow label="Euro" value={`€${data.fx.EUR?.toFixed(4)}`} />
                    <StatRow label="Japanese Yen" value={`¥${data.fx.JPY?.toFixed(2)}`} />
                    <StatRow label="Australian Dollar" value={`A$${data.fx.AUD?.toFixed(4)}`} />
                    <StatRow label="Canadian Dollar" value={`C$${data.fx.CAD?.toFixed(4)}`} />
                  </>
                ) : (
                  <p className="px-3 py-2 text-xs text-[#64748b]">Exchange rate data unavailable</p>
                )}
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}
