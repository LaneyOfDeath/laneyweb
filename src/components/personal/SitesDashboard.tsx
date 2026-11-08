"use client";

import { clsx } from "clsx";
import { CheckCircle2, XCircle, ShieldQuestion } from "lucide-react";
import { useApi, Panel, Loading, ErrorBox, Updated } from "./ui";

interface Result { id: string; name: string; desc: string; url: string; ok: boolean; blocked?: boolean; status: number; ms: number; detail: string | null }
interface Sites { results: Result[]; updated: string }

export default function SitesDashboard() {
  const { data, error, isLoading } = useApi<Sites>("/api/sites", 60000);
  if (isLoading) return <Loading label="Checking sites…" />;
  if (error || !data) return <div className="p-4"><ErrorBox message={`Check failed: ${error?.message ?? "unknown"}`} /></div>;

  const allOk = data.results.every((r) => r.ok);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl">
      <Panel right={<Updated iso={data.updated} />}>
        <div className="flex items-center gap-3">
          <span className={clsx("w-3 h-3 rounded-full", allOk ? "bg-emerald-400 shadow-[0_0_12px_#34d399]" : "bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse")} />
          <p className="text-lg font-black text-white">{allOk ? (data.results.some((r) => r.blocked) ? "Nothing reported down" : "Everything is up") : "Something is down"}</p>
        </div>
        <p className="text-[11px] text-[#4a6080] mt-1">Checked every minute from Vercel while this page is open.</p>
      </Panel>

      <div className="grid gap-3 sm:grid-cols-2">
        {data.results.map((r) => (
          <Panel key={r.id}>
            <div className="flex items-start gap-3">
              {r.blocked ? <ShieldQuestion className="w-5 h-5 text-amber-400 flex-shrink-0" /> : r.ok ? <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">{r.name} <span className="text-[#4a6080] font-normal">· {r.desc}</span></p>
                <p className="text-[11px] text-[#4a6080] truncate">{r.url.replace("https://", "")}</p>
                {r.detail && <p className={clsx("text-[11px] mt-1", r.blocked ? "text-amber-300/80" : "text-[#9fb3cc]")}>{r.detail}</p>}
              </div>
              <div className="text-right">
                <p className={clsx("text-sm font-bold tabular-nums", r.ms < 500 ? "text-emerald-300" : r.ms < 2000 ? "text-amber-300" : "text-red-300")}>{r.ms} ms</p>
                <p className="text-[10px] text-[#4a6080]">HTTP {r.status || "—"}</p>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
