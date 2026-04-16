"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Car,
  Anchor,
  PlaneTakeoff,
  MapPin,
  Trophy,
  TrendingUp,
  Newspaper,
  Gamepad2,
  ChevronLeft,
  ChevronRight,
  Radio,
  Globe,
  CloudSun,
  Rocket,
  Mountain,
  Zap,
  Wifi,
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, color: "text-cyan-400" },
  { href: "/traffic", label: "Traffic", icon: Car, color: "text-yellow-400" },
  { href: "/marine", label: "Marine", icon: Anchor, color: "text-blue-400" },
  { href: "/aircraft", label: "Aircraft", icon: PlaneTakeoff, color: "text-sky-400" },
  { href: "/gps", label: "GPS / Maps", icon: MapPin, color: "text-green-400" },
  { href: "/sports", label: "Sports Stats", icon: Trophy, color: "text-orange-400" },
  { href: "/stocks", label: "Stock Market", icon: TrendingUp, color: "text-emerald-400" },
  { href: "/news", label: "Live News", icon: Newspaper, color: "text-purple-400" },
  { href: "/gaming", label: "Gaming Top 10", icon: Gamepad2, color: "text-pink-400" },
  { href: "/weather", label: "Weather", icon: CloudSun, color: "text-sky-300" },
  { href: "/space", label: "Space", icon: Rocket, color: "text-violet-400" },
  { href: "/earth", label: "Earth Activity", icon: Mountain, color: "text-amber-400" },
  { href: "/power", label: "Power Grid", icon: Zap, color: "text-lime-400" },
  { href: "/internet", label: "Internet", icon: Wifi, color: "text-rose-400" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={clsx(
        "flex flex-col h-full transition-all duration-300 ease-in-out flex-shrink-0",
        "border-r border-[#1e2a3a]",
        collapsed ? "w-16" : "w-60"
      )}
      style={{ background: "var(--sidebar-bg)" }}
    >
      {/* Logo */}
      <div className={clsx(
        "flex items-center gap-3 px-4 py-5 border-b border-[#1e2a3a]",
        collapsed && "justify-center"
      )}>
        <div className="relative flex-shrink-0">
          <Globe className="w-8 h-8 text-cyan-400" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#0d1224]" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-sm text-white leading-tight tracking-wide">
              LAANEYWEB
            </p>
            <p className="text-[10px] text-[#64748b] uppercase tracking-widest">
              Live Intelligence
            </p>
          </div>
        )}
      </div>

      {/* Live indicator */}
      {!collapsed && (
        <div className="mx-3 mt-3 mb-1 flex items-center gap-2 px-3 py-2 rounded-md bg-green-400/10 border border-green-400/20">
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span className="text-[11px] text-green-400 font-semibold tracking-wider uppercase">
            All feeds live
          </span>
          <Radio className="w-3 h-3 text-green-400 ml-auto" />
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, color }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                "transition-all duration-150 group relative",
                active
                  ? "bg-cyan-500/15 text-white"
                  : "text-[#94a3b8] hover:bg-white/5 hover:text-white",
                collapsed && "justify-center"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-cyan-400 rounded-r-full" />
              )}
              <Icon className={clsx("w-4.5 h-4.5 flex-shrink-0", active ? color : "text-[#64748b] group-hover:" + color.replace("text-", "text-"))} />
              {!collapsed && <span>{label}</span>}
              {!collapsed && active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-[#1e2a3a] p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={clsx(
            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#64748b]",
            "hover:bg-white/5 hover:text-white transition-colors text-sm",
            collapsed && "justify-center"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
