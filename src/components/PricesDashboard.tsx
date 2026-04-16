"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, TrendingUp, TrendingDown, Fuel, DollarSign, Bitcoin } from "lucide-react";

interface FuelData { date: string; unleaded: number | null; diesel: number | null; }
interface FXData { USD: number; EUR: number; JPY: number; AUD: number; CAD: number; }
interface CryptoData {
  bitcoin: { gbp: number; gbp_24h_change: number };
  ethereum: { gbp: number; gbp_24h_change: number };
  solana: { gbp: number; gbp_24h_change: number };
}

interface PricesResponse {
  fuel: FuelData | null;
  fx: FXData | null;
  crypto: CryptoData | null;
  timestamp: number;
}

function StatRow({ label, value, sub, change }: { label: string; value: string; sub?: string; change?: number }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2a3a]/60 hover:bg-white/5">
      <div>
        <p className="text-sm text-white font-medium">{label}</p>
        {sub && <p className="text-[10px] text-[#64748b] mt-0.5">{sub}</p>}
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-white">{value}</p>
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
    <div className={`flex items-center gap-2 px-4 py-2.5 border-b border-[#1e2a3a] bg-white/2`}>
      <Icon className={`w-3.5 h-3.5 ${color}`} />
      <span className={`text-[11px] font-semibold uppercase tracking-widest ${color}`}>{title}</span>
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
    const interval = setInterval(fetchData, 300000); // refresh every 5 mins
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2a3a]">
        <p className="text-xs text-[#64748b]">UK fuel, exchange rates & crypto</p>
        <div className="flex items-center gap-3 text-xs text-[#64748b]">
          {lastUpdate && <span>Updated {lastUpdate.toLocaleTimeString()}</span>}
          <button onClick={fetchData} disabled={loading}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#94a3b8] hover:text-white transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!data ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="w-6 h-6 text-[#64748b] animate-spin" />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto py-4 px-4 space-y-4">

            {/* Fuel Prices */}
            <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] overflow-hidden">
              <SectionHeader icon={Fuel} title="UK Pump Prices (pence/litre)" color="text-orange-400" />
              {data.fuel ? (
                <>
                  <StatRow label="Unleaded (E10)" value={data.fuel.unleaded ? `${data.fuel.unleaded.toFixed(1)}p` : "N/A"} sub={`Week of ${data.fuel.date}`} />
                  <StatRow label="Diesel" value={data.fuel.diesel ? `${data.fuel.diesel.toFixed(1)}p` : "N/A"} sub="Source: gov.uk BEIS" />
                </>
              ) : (
                <p className="px-4 py-4 text-xs text-[#64748b]">Fuel data unavailable</p>
              )}
            </div>

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
                <p className="px-4 py-4 text-xs text-[#64748b]">Exchange rate data unavailable</p>
              )}
            </div>

            {/* Crypto */}
            <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] overflow-hidden">
              <SectionHeader icon={Bitcoin} title="Crypto Prices (GBP)" color="text-yellow-400" />
              {data.crypto ? (
                <>
                  <StatRow label="Bitcoin" value={`£${data.crypto.bitcoin?.gbp?.toLocaleString()}`} change={data.crypto.bitcoin?.gbp_24h_change} sub="BTC · 24h change" />
                  <StatRow label="Ethereum" value={`£${data.crypto.ethereum?.gbp?.toLocaleString()}`} change={data.crypto.ethereum?.gbp_24h_change} sub="ETH · 24h change" />
                  <StatRow label="Solana" value={`£${data.crypto.solana?.gbp?.toLocaleString()}`} change={data.crypto.solana?.gbp_24h_change} sub="SOL · 24h change" />
                </>
              ) : (
                <p className="px-4 py-4 text-xs text-[#64748b]">Crypto data unavailable</p>
              )}
            </div>

            <p className="text-[10px] text-[#64748b] text-center pb-2">
              Fuel: gov.uk BEIS · Rates: exchangerate-api.com · Crypto: CoinGecko · Refreshes every 5 minutes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
