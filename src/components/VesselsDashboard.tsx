"use client";

import { useState } from "react";
import { PlaneTakeoff, Anchor } from "lucide-react";
import { clsx } from "clsx";
import AircraftMap from "./AircraftMap";
import MarineMap from "./MarineMap";

type Tab = "aircraft" | "marine";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "aircraft", label: "Aircraft (ADS-B)", icon: PlaneTakeoff },
  { id: "marine",   label: "Marine / Ships",   icon: Anchor        },
];

export default function VesselsDashboard() {
  const [tab, setTab] = useState<Tab>("aircraft");
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
                ? "bg-sky-500/20 text-sky-400 border-sky-500/30"
                : "bg-white/5 text-[#94a3b8] border-[#1e2a3a] hover:text-white hover:bg-white/10"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0">
        {tab === "aircraft" && <AircraftMap />}
        {tab === "marine"   && <MarineMap   />}
      </div>
    </div>
  );
}
