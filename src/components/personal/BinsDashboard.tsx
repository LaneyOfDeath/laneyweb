"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { Search, Trash2 } from "lucide-react";
import { Panel, Loading, ErrorBox, fmtDate } from "./ui";

interface Bin { bin: string; date: string }
const KEY = "laneyweb.bins.property";

// Oldham Council colours (bin names come from the council page).
const COLOURS: Record<string, { cls: string; what: string }> = {
  Grey:  { cls: "bg-slate-500",   what: "General rubbish" },
  Blue:  { cls: "bg-blue-500",    what: "Paper and card" },
  Brown: { cls: "bg-amber-800",   what: "Glass, cans and plastic bottles" },
  Green: { cls: "bg-emerald-600", what: "Garden and food waste" },
};

function daysUntil(iso: string) {
  const today = new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" }));
  return Math.round((new Date(iso).getTime() - today.getTime()) / 86400000);
}

function when(iso: string) {
  const d = daysUntil(iso);
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  return `In ${d} days`;
}

export default function BinsDashboard() {
  const [saved, setSaved] = useState<{ uprn: string; address: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [postcode, setPostcode] = useState("");
  const [addresses, setAddresses] = useState<{ uprn: string; address: string }[] | null>(null);
  const [bins, setBins] = useState<Bin[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try { const s = localStorage.getItem(KEY); if (s) setSaved(JSON.parse(s)); } catch { /* ignore */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!saved) return;
    setBins(null); setError(null);
    fetch(`/api/bins?uprn=${saved.uprn}`).then((r) => r.json())
      .then((d) => d.error ? setError(d.error) : setBins(d.bins))
      .catch(() => setError("Council site unreachable"));
  }, [saved]);

  const search = async () => {
    setBusy(true); setError(null); setAddresses(null);
    try {
      const d = await fetch(`/api/bins?postcode=${encodeURIComponent(postcode)}`).then((r) => r.json());
      if (d.error) setError(d.error);
      else if (!d.addresses.length) setError("No Oldham addresses for that postcode");
      else setAddresses(d.addresses);
    } catch { setError("Council site unreachable"); }
    setBusy(false);
  };

  const choose = (a: { uprn: string; address: string }) => {
    setSaved(a); setAddresses(null);
    try { localStorage.setItem(KEY, JSON.stringify(a)); } catch { /* ignore */ }
  };

  if (!ready) return <Loading />;

  if (!saved) {
    return (
      <div className="p-4 space-y-4 max-w-xl">
        <Panel title="Find your bins (Oldham Council)">
          <p className="text-xs text-[#4a6080] mb-3">Saved in this browser only, never on the site.</p>
          <div className="flex gap-2">
            <input value={postcode} onChange={(e) => setPostcode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && search()} placeholder="Postcode, e.g. OL1 1UT"
              className="flex-1 rounded-lg border border-[#1f3150] bg-[#0a1726] px-3 py-2 text-sm text-white" />
            <button onClick={search} disabled={busy || postcode.length < 5}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40 flex items-center gap-1">
              <Search className="w-4 h-4" /> Find
            </button>
          </div>
          {addresses && (
            <div className="mt-3 max-h-80 overflow-y-auto space-y-1">
              {addresses.map((a) => (
                <button key={a.uprn} onClick={() => choose(a)}
                  className="block w-full text-left text-xs rounded-lg px-3 py-2 hover:bg-white/5 text-[#c5d3e6]">
                  {a.address}
                </button>
              ))}
            </div>
          )}
        </Panel>
        {error && <ErrorBox message={error} />}
      </div>
    );
  }

  const next = bins?.[0];
  const nextGroup = bins?.filter((b) => b.date === next?.date) ?? [];
  const later = bins?.filter((b) => b.date !== next?.date) ?? [];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl">
      {error && <ErrorBox message={error} />}
      {!bins && !error && <Loading label="Asking the council…" />}
      {bins && bins.length === 0 && <ErrorBox message={`No collections listed for ${saved.address}`} />}
      {next && (
        <Panel title="Next collection">
          <p className="text-3xl font-black text-white">{when(next.date)}</p>
          <p className="text-xs text-[#4a6080] mb-4">{fmtDate(next.date, { weekday: "long", day: "numeric", month: "long" })} · put them out the night before</p>
          <div className="flex flex-wrap gap-3">
            {nextGroup.map((b) => (
              <div key={b.bin} className="flex items-center gap-3 rounded-xl border border-[#1f3150] bg-[#0a1726] px-4 py-3">
                <div className={clsx("w-8 h-10 rounded-md flex items-center justify-center", COLOURS[b.bin]?.cls ?? "bg-gray-600")}>
                  <Trash2 className="w-4 h-4 text-white/80" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{b.bin} bin</p>
                  <p className="text-[11px] text-[#4a6080]">{COLOURS[b.bin]?.what ?? ""}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
      {later.length > 0 && (
        <Panel title="After that">
          <div className="space-y-2">
            {later.map((b) => (
              <div key={b.bin + b.date} className="flex items-center gap-3 text-sm">
                <span className={clsx("w-3 h-3 rounded-sm", COLOURS[b.bin]?.cls ?? "bg-gray-600")} />
                <span className="text-white w-16">{b.bin}</span>
                <span className="text-[#9fb3cc]">{fmtDate(b.date, { weekday: "short", day: "numeric", month: "short" })}</span>
                <span className="text-[11px] text-[#4a6080]">{when(b.date)}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}
      <button onClick={() => { setSaved(null); setBins(null); try { localStorage.removeItem(KEY); } catch { /* ignore */ } }}
        className="text-[11px] text-[#4a6080] hover:text-white underline">
        Change address
      </button>
    </div>
  );
}
