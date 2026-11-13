import Link from "next/link";
import {
  PlaneTakeoff, Plane, MapPin, Trophy, TrendingUp,
  Gamepad2, Globe, CloudSun, Rocket, Zap, HelpCircle,
  Shield, Flame, AlertTriangle,
  Train, Radio, Gauge, Building2, TramFront, Trash2, Activity,
} from "lucide-react";
import HomeAlertLayer from "@/components/HomeAlertLayer";

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
    title: "Mine",
    modules: [
      { href: "/fpl",       label: "Claude's XI",     icon: Trophy,       color: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/20",  badge: "Live",    badgeColor: "green"  },
      { href: "/city",      label: "Man City",        icon: Shield,       color: "text-sky-400",    bg: "bg-sky-400/10",    border: "border-sky-400/20",    badge: "Live",    badgeColor: "green"  },
      { href: "/metrolink", label: "Metrolink",       icon: TramFront,    color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", badge: "Live",    badgeColor: "green"  },
      { href: "/bins",      label: "Bin Day",         icon: Trash2,       color: "text-emerald-400",bg: "bg-emerald-400/10",border: "border-emerald-400/20",badge: "Tool",    badgeColor: "cyan"   },
      { href: "/drops",     label: "Game Drops",      icon: Gamepad2,     color: "text-emerald-400",bg: "bg-emerald-400/10",border: "border-emerald-400/20",badge: "Updated", badgeColor: "yellow" },
      { href: "/sites",     label: "My Sites",        icon: Activity,     color: "text-emerald-400",bg: "bg-emerald-400/10",border: "border-emerald-400/20",badge: "Live",    badgeColor: "green"  },
    ],
  },
  {
    title: "Transport",
    modules: [
      { href: "/transport", label: "UK Live Transport Data", icon: Train, color: "text-sky-400",    bg: "bg-sky-400/10",    border: "border-sky-400/20",    badge: "Live",    badgeColor: "green"  },
      { href: "/planes",    label: "Planes",          icon: Plane,        color: "text-cyan-400",   bg: "bg-cyan-400/10",   border: "border-cyan-400/20",   badge: "Live",    badgeColor: "green"  },
      { href: "/vessels",   label: "Vessels",         icon: PlaneTakeoff, color: "text-sky-400",    bg: "bg-sky-400/10",    border: "border-sky-400/20",    badge: "Live",    badgeColor: "green"  },
      { href: "/gps",       label: "GPS / Maps",      icon: MapPin,       color: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/20",  badge: "Live",    badgeColor: "cyan"   },
    ],
  },
  {
    title: "Environment",
    modules: [
      { href: "/weather",   label: "Weather",         icon: CloudSun,     color: "text-sky-300",    bg: "bg-sky-300/10",    border: "border-sky-300/20",    badge: "Live",    badgeColor: "green"  },
      { href: "/hazards",   label: "Hazards",         icon: Flame,        color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20", badge: "Live",    badgeColor: "green"  },
      { href: "/power",     label: "Power Grid",      icon: Zap,          color: "text-lime-400",   bg: "bg-lime-400/10",   border: "border-lime-400/20",   badge: "Live",    badgeColor: "green"  },
    ],
  },
  {
    title: "Space",
    modules: [
      { href: "/space",     label: "Space",           icon: Rocket,       color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20", badge: "Live",    badgeColor: "green"  },
    ],
  },
  {
    title: "Technology",
    modules: [
      { href: "/social",    label: "Online & Social", icon: Globe,        color: "text-rose-400",   bg: "bg-rose-400/10",   border: "border-rose-400/20",   badge: "Live",    badgeColor: "green"  },
      { href: "/companies", label: "Companies House", icon: Building2,    color: "text-cyan-400",   bg: "bg-cyan-400/10",   border: "border-cyan-400/20",   badge: "Live",    badgeColor: "green"  },
      { href: "/crime",     label: "Police Crime Data",icon: AlertTriangle,color: "text-red-400",   bg: "bg-red-400/10",    border: "border-red-400/20",    badge: "Live",    badgeColor: "green"  },
      { href: "/security",  label: "Security",        icon: Shield,       color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", badge: "Live",    badgeColor: "green"  },
      { href: "/speed",     label: "Speed Test",      icon: Gauge,        color: "text-cyan-400",   bg: "bg-cyan-400/10",   border: "border-cyan-400/20",   badge: "Tool",    badgeColor: "cyan"   },
    ],
  },
  {
    title: "Finance",
    modules: [
      { href: "/finance",   label: "Finance",         icon: TrendingUp,   color: "text-emerald-400",bg: "bg-emerald-400/10",border: "border-emerald-400/20",badge: "Live",    badgeColor: "green"  },
    ],
  },
  {
    title: "Entertainment",
    modules: [
      { href: "/sports",    label: "Sports Stats",    icon: Trophy,       color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20", badge: "Live",    badgeColor: "green"  },
      { href: "/gaming",    label: "Gaming Top 10",   icon: Gamepad2,     color: "text-pink-400",   bg: "bg-pink-400/10",   border: "border-pink-400/20",   badge: "Updated", badgeColor: "yellow" },
      { href: "/radio",     label: "Radio",           icon: Radio,        color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20", badge: "Live",    badgeColor: "green"  },
      { href: "/quiz",      label: "Trivia Quiz",     icon: HelpCircle,   color: "text-yellow-300", bg: "bg-yellow-300/10", border: "border-yellow-300/20", badge: "Fun",     badgeColor: "yellow" },
    ],
  },
];

const totalModules = sections.reduce((n, s) => n + s.modules.length, 0);

export default function DashboardPage() {
  return (
    <div className="min-h-full">
      <header className="pl-14 md:pl-8 pr-32 pt-8 pb-6 border-b border-[var(--rule)] bg-[var(--navy)]">
        <h1 className="text-[56px] md:text-[72px] font-bold leading-[0.9] text-[var(--paper)]">LaneyWeb</h1>
        <p className="mt-3 text-base text-[var(--soft)] max-w-[60ch]">
          {totalModules} live pages on what is moving right now: planes, trams, the power grid, the weather, the football.
          Everything updates by itself and nothing needs a login.
        </p>
      </header>

      <HomeAlertLayer />

      <div className="px-4 md:px-8 py-6 grid gap-x-10 gap-y-8" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
        {sections.map(({ title, modules }) => (
          <section key={title}>
            <h2 className="text-[22px] font-semibold text-[var(--paper)] leading-none pb-2 border-b-2 border-[var(--amber)]">{title}</h2>
            <ul>
              {modules.map(({ href, label, icon: Icon, badge }) => (
                <li key={href} className="border-b border-[var(--rule)]">
                  <Link
                    href={href}
                    className="group flex items-center gap-3 py-2.5 text-base text-[var(--paper)] hover:text-[var(--amber)]"
                  >
                    <Icon className="w-4 h-4 text-[var(--dim)] group-hover:text-[var(--amber)]" aria-hidden />
                    <span className="flex-1">{label}</span>
                    {badge !== "Live" && <span className="text-sm text-[var(--dim)]">{badge}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
