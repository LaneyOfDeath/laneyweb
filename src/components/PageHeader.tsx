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
    <div className="flex flex-wrap items-center justify-between gap-3 pl-14 md:pl-6 pr-32 py-4 border-b border-[var(--rule)] bg-[var(--navy)]">
      <div className="flex items-center gap-3 min-w-0">
        <Icon className={clsx("w-6 h-6 flex-shrink-0", iconColor)} aria-hidden />
        <div className="min-w-0">
          <h1 className="text-[28px] font-semibold text-[var(--paper)] leading-none">{title}</h1>
          <p className="text-sm text-[var(--dim)] mt-1 truncate">{subtitle}</p>
        </div>
        {live && (
          <span className="flex items-center gap-1.5 ml-2 text-sm text-[var(--soft)] flex-shrink-0">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Live
          </span>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
