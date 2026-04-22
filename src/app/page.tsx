import Link from "next/link";
import {
  Car, Anchor, PlaneTakeoff, MapPin, Trophy, TrendingUp, Newspaper,
  Gamepad2, Globe, CloudSun, Rocket, Mountain, Zap, Wifi, HelpCircle,
  Droplets, PoundSterling, Shield, Flame, Wind, Train, Radio, Plane, Gauge, Telescope, Flower2, Satellite, MessagesSquare,
} from "lucide-react";
import LiveBadge from "@/components/LiveBadge";

type BadgeColor = "green" | "yellow" | "cyan";

interface Module {
  href: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  badge: string;
  badgeColor: BadgeColor;
}

const sections: { title: string; modules: Module[] }[] = [
  {
    title: "Transport",
    modules: [
      { href: "/traffic",   label: "Traffic",         icon: Car,          color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", badge: "Live",    badgeColor: "green" },
      { href: "/marine",    label: "Marine",          icon: Anchor,       color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/20",   badge: "Live",    badgeColor: "green" },
      { href: "/flights",   label: "Flights",         icon: Plane,        color: "text-sky-400",    bg: "bg-sky-400/10",    border: "border-sky-400/20",    badge: "Live",    badgeColor: "green" },
      { href: "/aircraft",  label: "Aircraft",        icon: PlaneTakeoff, color: "text-sky-400",    bg: "bg-sky-400/10",    border: "border-sky-400/20",    badge: "Live",    badgeColor: "green" },
      { href: "/transport", label: "UK Transport",    icon: Train,        color: "text-sky-400",    bg: "bg-sky-400/10",    border: "border-sky-400/20",    badge: "Live",    badgeColor: "green" },
      { href: "/gps",       label: "GPS / Maps",      icon: MapPin,       color: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/20",  badge: "Live",    badgeColor: "cyan"  },
    ],
  },
  {
    title: "Environment",
    modules: [
      { href: "/weather",   label: "Weather",         icon: CloudSun,     color: "text-sky-300",    bg: "bg-sky-300/10",    border: "border-sky-300/20",    badge: "Live",    badgeColor: "green" },
      { href: "/air",       label: "Air Quality",     icon: Wind,         color: "text-emerald-400",bg: "bg-emerald-400/10",border: "border-emerald-400/20",badge: "Live",    badgeColor: "green" },
      { href: "/pollen",    label: "Pollen Forecast", icon: Flower2,      color: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/20",  badge: "Live",    badgeColor: "green" },
      { href: "/earth",     label: "Earth Activity",  icon: Mountain,     color: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/20",  badge: "Live",    badgeColor: "green" },
      { href: "/fire",      label: "Fire Map",        icon: Flame,        color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20", badge: "Live",    badgeColor: "green" },
      { href: "/flood",     label: "Flood Warnings",  icon: Droplets,     color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/20",   badge: "Live",    badgeColor: "green" },
      { href: "/power",     label: "Power Grid",      icon: Zap,          color: "text-lime-400",   bg: "bg-lime-400/10",   border: "border-lime-400/20",   badge: "Live",    badgeColor: "green" },
    ],
  },
  {
    title: "Space",
    modules: [
      { href: "/apod",       label: "Astronomy APOD",    icon: Telescope,  color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20", badge: "Daily",  badgeColor: "cyan"  },
      { href: "/iss",        label: "ISS Tracker",       icon: Rocket,     color: "text-cyan-400",   bg: "bg-cyan-400/10",   border: "border-cyan-400/20",   badge: "Live",   badgeColor: "green" },
      { href: "/satellites", label: "Satellite Tracker", icon: Satellite,  color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20", badge: "Live",   badgeColor: "green" },
      { href: "/space",      label: "Launches & Space",  icon: Rocket,     color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20", badge: "Live",   badgeColor: "green" },
    ],
  },
  {
    title: "Technology",
    modules: [
      { href: "/internet",  label: "Internet Trends",  icon: Wifi,         color: "text-rose-400",   bg: "bg-rose-400/10",   border: "border-rose-400/20",   badge: "Live",   badgeColor: "green" },
      { href: "/cyber",     label: "Cyber Security",   icon: Shield,       color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/20",    badge: "KEV",    badgeColor: "cyan"  },
      { href: "/tor",       label: "Tor Network",      icon: Shield,       color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", badge: "Stats",  badgeColor: "cyan"  },
      { href: "/mastodon",  label: "Mastodon Trending",icon: MessagesSquare,color:"text-indigo-400", bg: "bg-indigo-400/10", border: "border-indigo-400/20", badge: "Live",   badgeColor: "green" },
      { href: "/speed",     label: "Speed Test",       icon: Gauge,        color: "text-cyan-400",   bg: "bg-cyan-400/10",   border: "border-cyan-400/20",   badge: "Tool",   badgeColor: "cyan"  },
    ],
  },
  {
    title: "Finance",
    modules: [
      { href: "/stocks",    label: "Stock Market",    icon: TrendingUp,   color: "text-emerald-400",bg: "bg-emerald-400/10",border: "border-emerald-400/20",badge: "Live",    badgeColor: "green" },
      { href: "/prices",    label: "UK Prices",       icon: PoundSterling,color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20", badge: "Live",    badgeColor: "green" },
    ],
  },
  {
    title: "Entertainment",
    modules: [
      { href: "/news",      label: "Live News",       icon: Newspaper,    color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", badge: "Live",    badgeColor: "green" },
      { href: "/sports",    label: "Sports Stats",    icon: Trophy,       color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20", badge: "Live",    badgeColor: "green" },
      { href: "/gaming",    label: "Gaming Top 10",   icon: Gamepad2,     color: "text-pink-400",   bg: "bg-pink-400/10",   border: "border-pink-400/20",   badge: "Updated", badgeColor: "yellow"},
      { href: "/radio",     label: "Radio",           icon: Radio,        color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20", badge: "Live",    badgeColor: "green" },
      { href: "/quiz",      label: "Trivia Quiz",     icon: HelpCircle,   color: "text-yellow-300", bg: "bg-yellow-300/10", border: "border-yellow-300/20", badge: "Fun",     badgeColor: "yellow"},
    ],
  },
];

const totalModules = sections.reduce((n, s) => n + s.modules.length, 0);

function ModuleCard({ href, label, icon: Icon, color, bg, border, badge, badgeColor }: Module) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2.5 p-3 rounded-xl border border-[#1a2640] bg-[#0d1e30]
                 hover:border-[#243352] transition-all duration-200 relative overflow-hidden"
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl ${bg}`}
        style={{ filter: "blur(1px)" }} />
      <div className="relative flex items-center justify-between">
        <div className={`w-8 h-8 rounded-lg ${bg} border ${border} flex items-center justify-center
                        group-hover:scale-110 transition-transform duration-200`}>
          <Icon className={`w-3.5 h-3.5 ${color}`} />
        </div>
        <LiveBadge label={badge} color={badgeColor} />
      </div>
      <p className={`relative text-xs font-semibold text-white leading-tight group-hover:${color} transition-colors duration-200`}>
        {label}
      </p>
    </Link>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-full">
      {/* Hero */}
      <div className="relative px-6 pt-4 pb-3 border-b border-[#1a2640] overflow-hidden">
        <div className="absolute -top-10 -left-10 w-64 h-64 rounded-full aurora"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute -bottom-10 right-20 w-48 h-48 rounded-full aurora"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)", filter: "blur(40px)", animationDelay: "4s" }} />

        <div className="relative flex items-center justify-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(59,130,246,0.15))", border: "1px solid rgba(6,182,212,0.3)", boxShadow: "0 0 16px rgba(6,182,212,0.2)" }}>
            <Globe className="w-5 h-5 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-black tracking-tight"
            style={{ background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            LaneyWeb
          </h1>
        </div>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <LiveBadge label="All systems live" color="green" />
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            {totalModules} modules
          </div>
          <span className="text-xs text-[#4a6080]">Data refreshes automatically · No login required</span>
        </div>
      </div>

      {/* Sections */}
      <div className="p-4 space-y-6">
        {sections.map(({ title, modules }) => (
          <div key={title}>
            <p className="text-sm font-black uppercase tracking-widest mb-2.5"
              style={{ background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {title}
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {modules.map((m) => (
                <ModuleCard key={m.href} {...m} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
