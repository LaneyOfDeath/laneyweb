"use client";

import { useState } from "react";
import { Newspaper, Wifi, MessagesSquare } from "lucide-react";
import { clsx } from "clsx";
import NewsDashboard from "./NewsDashboard";
import InternetDashboard from "./InternetDashboard";
import MastodonDashboard from "./MastodonDashboard";

type Tab = "news" | "internet" | "mastodon";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "news",     label: "Live News",       icon: Newspaper      },
  { id: "internet", label: "Internet Trends", icon: Wifi           },
  { id: "mastodon", label: "Mastodon",        icon: MessagesSquare },
];

export default function SocialDashboard() {
  const [tab, setTab] = useState<Tab>("news");
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
                ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                : "bg-white/5 text-[#94a3b8] border-[#1e2a3a] hover:text-white hover:bg-white/10"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {tab === "news"     && <NewsDashboard     />}
        {tab === "internet" && <InternetDashboard />}
        {tab === "mastodon" && <MastodonDashboard />}
      </div>
    </div>
  );
}
