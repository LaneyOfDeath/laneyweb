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
  Menu,
  X,
  Radio,
  Plane,
  Globe,
  CloudSun,
  Rocket,
  Mountain,
  Zap,
  Wifi,
  HelpCircle,
  Droplets,
  PoundSterling,
  Shield,
  Flame,
  Wind,
  Train,
  Gauge,
  Telescope,
  Flower2,
  Satellite,
  MessagesSquare,
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, color: "text-cyan-400" },
  { href: "/aircraft", label: "Aircraft", icon: PlaneTakeoff, color: "text-sky-400" },
  { href: "/earth", label: "Earth Activity", icon: Mountain, color: "text-amber-400" },
  { href: "/flights", label: "Flights", icon: Plane, color: "text-sky-400" },
  { href: "/flood", label: "Flood Warnings", icon: Droplets, color: "text-blue-400" },
  { href: "/gaming", label: "Gaming Top 10", icon: Gamepad2, color: "text-pink-400" },
  { href: "/gps", label: "GPS / Maps", icon: MapPin, color: "text-green-400" },
  { href: "/internet", label: "Internet", icon: Wifi, color: "text-rose-400" },
  { href: "/iss", label: "ISS Tracker", icon: Rocket, color: "text-cyan-400" },
  { href: "/marine", label: "Marine", icon: Anchor, color: "text-blue-400" },
  { href: "/news", label: "Live News", icon: Newspaper, color: "text-purple-400" },
  { href: "/power", label: "Power Grid", icon: Zap, color: "text-lime-400" },
  { href: "/prices", label: "UK Prices", icon: PoundSterling, color: "text-orange-400" },
  { href: "/air", label: "Air Quality", icon: Wind, color: "text-emerald-400" },
  { href: "/pollen", label: "Pollen Forecast", icon: Flower2, color: "text-green-400" },
  { href: "/cyber", label: "Cyber Security", icon: Shield, color: "text-red-400" },
  { href: "/fire", label: "Global Fire Map", icon: Flame, color: "text-orange-400" },
  { href: "/radio", label: "Radio", icon: Radio, color: "text-violet-400" },
  { href: "/apod",       label: "Astronomy APOD",   icon: Telescope, color: "text-violet-400" },
  { href: "/satellites", label: "Satellite Tracker", icon: Satellite, color: "text-violet-400" },
  { href: "/space", label: "Space", icon: Rocket, color: "text-violet-400" },
  { href: "/transport", label: "UK Transport", icon: Train, color: "text-sky-400" },
  { href: "/sports", label: "Sports Stats", icon: Trophy, color: "text-orange-400" },
  { href: "/stocks", label: "Stock Market", icon: TrendingUp, color: "text-emerald-400" },
  { href: "/tor", label: "Tor Network", icon: Shield, color: "text-purple-400" },
  { href: "/traffic", label: "Traffic", icon: Car, color: "text-yellow-400" },
  { href: "/mastodon", label: "Mastodon Trending", icon: MessagesSquare, color: "text-indigo-400" },
  { href: "/quiz", label: "Trivia Quiz", icon: HelpCircle, color: "text-yellow-300" },
  { href: "/speed", label: "Speed Test", icon: Gauge, color: "text-cyan-400" },
  { href: "/weather", label: "Weather", icon: CloudSun, color: "text-sky-300" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (mobile = false) => (
    <aside
      className={clsx(
        "flex flex-col h-full transition-all duration-300 ease-in-out flex-shrink-0",
        "border-r border-[#252538]",
        mobile ? "w-72" : collapsed ? "w-16" : "w-60"
      )}
      style={{
        background: "linear-gradient(180deg, #0d0d18 0%, #0b0b14 50%, #0d0d17 100%)",
        boxShadow: "inset -1px 0 0 rgba(0,245,255,0.08)",
      }}
    >
      {/* Logo */}
      <div className={clsx(
        "flex items-center gap-3 px-4 py-5 border-b border-[#252538]",
        !mobile && collapsed && "justify-center"
      )}
        style={{ background: "linear-gradient(135deg, rgba(0,245,255,0.06) 0%, transparent 100%)" }}
      >
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center"
            style={{ boxShadow: "0 0 16px rgba(0,245,255,0.3)" }}>
            <Globe className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#0a0e1c]"
            style={{ boxShadow: "0 0 6px rgba(16,185,129,0.6)" }} />
        </div>
        {(mobile || !collapsed) && (
          <div className="flex-1">
            <p className="font-black text-sm tracking-wide"
              style={{ background: "linear-gradient(135deg, #00f5ff, #ff006e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              LANEYWEB
            </p>
            <p className="text-[10px] text-[#4a6080] uppercase tracking-widest">Live Intelligence</p>
          </div>
        )}
        {mobile && (
          <button onClick={() => setMobileOpen(false)} className="p-1 text-[#64748b] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Live indicator */}
      {(mobile || !collapsed) && (
        <div className="mx-3 mt-3 mb-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-green-400/8 border border-green-400/15"
          style={{ boxShadow: "0 0 12px rgba(16,185,129,0.06)" }}>
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"
              style={{ boxShadow: "0 0 6px rgba(16,185,129,0.8)" }} />
          </span>
          <span className="text-[11px] text-green-400 font-semibold tracking-wider uppercase">All feeds live</span>
          <Radio className="w-3 h-3 text-green-400 ml-auto" />
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, color }) => {
          const active = pathname === href;
          const glowColor = color.replace("text-", "").replace("-400", "").replace("-300", "");
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              title={!mobile && collapsed ? label : undefined}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                "transition-all duration-200 group relative",
                active ? "text-white" : "text-[#60607a] hover:bg-white/5 hover:text-[#9898b8]",
                !mobile && collapsed && "justify-center"
              )}
              style={active ? {
                background: "rgba(0,245,255,0.06)",
                boxShadow: "inset 0 0 0 1px rgba(0,245,255,0.12)",
              } : undefined}
            >
              {active && (
                <span className={clsx("absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full", color.replace("text-", "bg-"))}
                  style={{ boxShadow: `0 0 8px currentColor` }} />
              )}
              <Icon className={clsx(
                "w-4 h-4 flex-shrink-0 transition-all duration-200",
                active ? color : `text-[#4a6080] group-hover:${color}`
              )} style={active ? { filter: `drop-shadow(0 0 4px currentColor)` } : undefined} />
              {(mobile || !collapsed) && (
                <span className={active ? "text-white" : ""}>{label}</span>
              )}
              {(mobile || !collapsed) && active && (
                <span className={clsx("ml-auto w-1.5 h-1.5 rounded-full", color.replace("text-", "bg-"))}
                  style={{ boxShadow: "0 0 4px currentColor" }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle — desktop only */}
      {!mobile && (
        <div className="border-t border-[#252538] p-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={clsx(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#64748b]",
              "hover:bg-white/5 hover:text-white transition-colors text-sm",
              collapsed && "justify-center"
            )}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
          </button>
        </div>
      )}
    </aside>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-[#13131f] border border-[#252538] text-[#9898b8] hover:text-white"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div className={clsx(
        "md:hidden fixed inset-y-0 left-0 z-50 transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebarContent(true)}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex h-full">
        {sidebarContent(false)}
      </div>
    </>
  );
}
