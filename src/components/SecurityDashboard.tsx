"use client";

import { useState } from "react";
import { Shield, Globe } from "lucide-react";
import { clsx } from "clsx";
import CyberDashboard from "./CyberDashboard";
import TorDashboard from "./TorDashboard";

type Tab = "cyber" | "tor";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "cyber", label: "Cyber Threats (CISA KEV)", icon: Shield },
  { id: "tor",   label: "Tor Network",               icon: Globe  },
];

export default function SecurityDashboard() {
  const [tab, setTab] = useState<Tab>("cyber");
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
                ? "bg-red-500/20 text-red-300 border-red-500/30"
                : "bg-white/5 text-[#94a3b8] border-[#1e2a3a] hover:text-white hover:bg-white/10"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0">
        {tab === "cyber" && <div className="h-full overflow-y-auto"><CyberDashboard /></div>}
        {tab === "tor"   && <TorDashboard />}
      </div>
    </div>
  );
}
