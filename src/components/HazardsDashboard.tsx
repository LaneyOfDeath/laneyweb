"use client";

import { useState } from "react";
import { Mountain, Flame, Droplets } from "lucide-react";
import { clsx } from "clsx";
import EarthDashboard from "./EarthDashboard";
import FireDashboard from "./FireDashboard";
import FloodDashboard from "./FloodDashboard";

type Tab = "earth" | "fire" | "flood";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "earth", label: "Earthquakes & Volcanoes", icon: Mountain },
  { id: "fire",  label: "Wildfires",               icon: Flame    },
  { id: "flood", label: "UK Flood Warnings",        icon: Droplets },
];

export default function HazardsDashboard() {
  const [tab, setTab] = useState<Tab>("earth");
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
                ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
                : "bg-white/5 text-[#94a3b8] border-[#1e2a3a] hover:text-white hover:bg-white/10"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0">
        {tab === "earth" && <div className="h-full overflow-y-auto"><EarthDashboard /></div>}
        {tab === "fire"  && <div className="h-full overflow-y-auto"><FireDashboard  /></div>}
        {tab === "flood" && <FloodDashboard />}
      </div>
    </div>
  );
}
