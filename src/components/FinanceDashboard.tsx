"use client";

import { useState } from "react";
import { TrendingUp, PoundSterling } from "lucide-react";
import { clsx } from "clsx";
import StocksDashboard from "./StocksDashboard";
import PricesDashboard from "./PricesDashboard";

type Tab = "stocks" | "prices";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "stocks", label: "Stock Market",      icon: TrendingUp    },
  { id: "prices", label: "UK Prices & Rates", icon: PoundSterling },
];

export default function FinanceDashboard() {
  const [tab, setTab] = useState<Tab>("stocks");
  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 px-4 py-2.5 border-b border-[#1e2a3a]">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors",
              tab === id
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : "bg-white/5 text-[#94a3b8] border-[#1e2a3a] hover:text-white hover:bg-white/10"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0">
        {tab === "stocks" && <div className="h-full overflow-y-auto"><StocksDashboard /></div>}
        {tab === "prices" && <PricesDashboard />}
      </div>
    </div>
  );
}
