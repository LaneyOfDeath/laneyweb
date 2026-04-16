import { clsx } from "clsx";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  iconColor?: string;
  live?: boolean;
  children?: React.ReactNode;
}

export default function PageHeader({
  icon: Icon,
  title,
  subtitle,
  iconColor = "text-cyan-400",
  live = true,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-[#1e2a3a]">
      <div className="flex items-center gap-4">
        <div
          className={clsx(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            "bg-white/5 border border-white/10"
          )}
        >
          <Icon className={clsx("w-5 h-5", iconColor)} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white leading-tight">{title}</h1>
          <p className="text-xs text-[#64748b] mt-0.5">{subtitle}</p>
        </div>
        {live && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-400/10 border border-green-400/20 ml-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
            </span>
            <span className="text-[10px] font-semibold text-green-400 uppercase tracking-wider">Live</span>
          </div>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
