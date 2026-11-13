"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Ship, MapPin, Trophy, TrendingUp, Gamepad2, Menu, X, Radio, Globe, CloudSun, Rocket,
  Zap, HelpCircle, Shield, Flame, AlertTriangle, Train, Gauge, Building2, TramFront, Trash2,
  Activity, Plane, Home,
} from "lucide-react";
import { clsx } from "clsx";

const groups = [
  {
    title: "Mine",
    items: [
      { href: "/fpl",       label: "Claude's XI",  icon: Trophy },
      { href: "/city",      label: "Man City",     icon: Shield },
      { href: "/metrolink", label: "Metrolink",    icon: TramFront },
      { href: "/bins",      label: "Bin day",      icon: Trash2 },
      { href: "/drops",     label: "Game drops",   icon: Gamepad2 },
      { href: "/sites",     label: "My sites",     icon: Activity },
    ],
  },
  {
    title: "Moving",
    items: [
      { href: "/planes",    label: "Planes",       icon: Plane },
      { href: "/vessels",   label: "Ships",        icon: Ship },
      { href: "/transport", label: "UK transport", icon: Train },
      { href: "/gps",       label: "Maps",         icon: MapPin },
    ],
  },
  {
    title: "Outside",
    items: [
      { href: "/weather",   label: "Weather",      icon: CloudSun },
      { href: "/hazards",   label: "Hazards",      icon: Flame },
      { href: "/power",     label: "Power grid",   icon: Zap },
      { href: "/space",     label: "Space",        icon: Rocket },
    ],
  },
  {
    title: "Records",
    items: [
      { href: "/companies", label: "Companies House", icon: Building2 },
      { href: "/crime",     label: "Police crime data", icon: AlertTriangle },
      { href: "/security",  label: "Security",     icon: Shield },
      { href: "/finance",   label: "Finance",      icon: TrendingUp },
      { href: "/social",    label: "Online and social", icon: Globe },
      { href: "/speed",     label: "Speed test",   icon: Gauge },
    ],
  },
  {
    title: "Fun",
    items: [
      { href: "/sports",    label: "Sports",       icon: Trophy },
      { href: "/gaming",    label: "Gaming",       icon: Gamepad2 },
      { href: "/radio",     label: "Radio",        icon: Radio },
      { href: "/quiz",      label: "Trivia quiz",  icon: HelpCircle },
    ],
  },
];

function NavLink({ href, label, icon: Icon, active, onClick }: {
  href: string; label: string; icon: React.ElementType; active: boolean; onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "flex items-center gap-2.5 pl-4 pr-3 py-[5px] text-[15px] border-l-[3px]",
        active
          ? "border-[var(--amber)] bg-[var(--navy-2)] text-[var(--paper)] font-semibold"
          : "border-transparent text-[var(--soft)] hover:text-[var(--paper)] hover:bg-[var(--navy-2)]",
      )}
    >
      <Icon className={clsx("w-4 h-4 flex-shrink-0", active ? "text-[var(--amber)]" : "text-[var(--dim)]")} aria-hidden />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function SidebarContent({ mobile, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  return (
    <aside className="flex flex-col h-full w-[210px] flex-shrink-0 border-r border-[var(--rule)] bg-[var(--navy)]">
      <div className="flex items-center justify-between pl-4 pr-3 h-[60px] border-b border-[var(--rule)] flex-shrink-0">
        <Link href="/" onClick={onClose} className="text-[26px] font-bold leading-none text-[var(--paper)]" style={{ fontFamily: "var(--font-pl-display)" }}>
          LaneyWeb
        </Link>
        {mobile && (
          <button onClick={onClose} aria-label="Close menu" className="p-1 text-[var(--dim)] hover:text-[var(--paper)]">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3" aria-label="Pages">
        <NavLink href="/" label="Home" icon={Home} active={pathname === "/"} onClick={onClose} />
        {groups.map((g) => (
          <div key={g.title} className="mt-4">
            <p className="pl-[19px] pb-1 text-[13px] text-[var(--dim)]">{g.title}</p>
            {g.items.map((it) => (
              <NavLink key={it.href} {...it} active={pathname === it.href} onClick={onClose} />
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-[var(--navy)] border border-[var(--rule)] text-[var(--soft)] hover:text-[var(--paper)]"
      >
        <Menu className="w-4 h-4" />
      </button>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setMobileOpen(false)} />
      )}

      <div className={clsx(
        "md:hidden fixed inset-y-0 left-0 z-50 transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent mobile onClose={() => setMobileOpen(false)} />
      </div>

      <div className="hidden md:flex h-full">
        <SidebarContent />
      </div>
    </>
  );
}
