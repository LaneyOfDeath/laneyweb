"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, PlaneTakeoff, MapPin, Trophy, TrendingUp,
  Gamepad2, Menu, X, Radio, Globe, CloudSun, Rocket,
  Zap, HelpCircle, Shield, Flame, AlertTriangle,
  Train, Gauge,
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/",          label: "Dashboard",        icon: LayoutDashboard, color: "text-cyan-400"    },
  { href: "/crime",     label: "Police Crime Data", icon: AlertTriangle,   color: "text-red-400"     },
  { href: "/finance",   label: "Finance",           icon: TrendingUp,      color: "text-emerald-400" },
  { href: "/gaming",    label: "Gaming",            icon: Gamepad2,        color: "text-pink-400"    },
  { href: "/gps",       label: "GPS / Maps",        icon: MapPin,          color: "text-green-400"   },
  { href: "/hazards",   label: "Hazards",           icon: Flame,           color: "text-orange-400"  },
  { href: "/power",     label: "Power Grid",        icon: Zap,             color: "text-lime-400"    },
  { href: "/quiz",      label: "Trivia Quiz",       icon: HelpCircle,      color: "text-yellow-300"  },
  { href: "/radio",     label: "Radio",             icon: Radio,           color: "text-violet-400"  },
  { href: "/security",  label: "Security",          icon: Shield,          color: "text-purple-400"  },
  { href: "/social",    label: "Online & Social",   icon: Globe,           color: "text-rose-400"    },
  { href: "/space",     label: "Space",             icon: Rocket,          color: "text-violet-400"  },
  { href: "/speed",     label: "Speed Test",        icon: Gauge,           color: "text-cyan-400"    },
  { href: "/sports",    label: "Sports",            icon: Trophy,          color: "text-orange-400"  },
  { href: "/transport", label: "UK Live Transport Data", icon: Train,       color: "text-sky-400"     },
  { href: "/vessels",   label: "Vessels",           icon: PlaneTakeoff,    color: "text-sky-400"     },
  { href: "/weather",   label: "Weather",           icon: CloudSun,        color: "text-sky-300"     },
];

function SidebarContent({ mobile, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  return (
    <aside
      className="flex flex-col h-full w-44 flex-shrink-0 border-r border-[#1e2633]"
      style={{ background: "linear-gradient(180deg,#0d0d18 0%,#0b0b14 100%)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-[#1e2633] flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0"
          style={{ boxShadow: "0 0 10px rgba(0,245,255,0.2)" }}>
          <Globe className="w-4 h-4 text-cyan-400" />
        </div>
        <p className="font-black text-xs tracking-wide flex-1"
          style={{ background: "linear-gradient(135deg,#00f5ff,#ff006e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          LANEYWEB
        </p>
        {mobile && (
          <button onClick={onClose} className="text-[#64748b] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-1.5 py-2 space-y-px">
        {navItems.map(({ href, label, icon: Icon, color }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={clsx(
                "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-medium",
                "transition-colors duration-150 relative group",
                active ? "text-white" : "text-[#4a5a6a] hover:text-[#9898b8] hover:bg-white/5"
              )}
              style={active ? { background: "rgba(0,245,255,0.06)", boxShadow: "inset 0 0 0 1px rgba(0,245,255,0.1)" } : undefined}
            >
              {active && (
                <span className={clsx("absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full", color.replace("text-", "bg-"))} />
              )}
              <Icon className={clsx("w-3.5 h-3.5 flex-shrink-0", active ? color : `text-[#3a4a5a] group-hover:${color}`)} />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-[#13131f] border border-[#252538] text-[#9898b8] hover:text-white"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <div className={clsx(
        "md:hidden fixed inset-y-0 left-0 z-50 transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent mobile onClose={() => setMobileOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex h-full">
        <SidebarContent />
      </div>
    </>
  );
}
