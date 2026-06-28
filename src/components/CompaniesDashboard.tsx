"use client";

import { useState, useCallback } from "react";
import {
  Search, X, Building2, RefreshCw, ArrowLeft, Users, KeyRound, FileText,
  MapPin, Calendar, Hash,
} from "lucide-react";

interface SearchItem {
  company_number: string;
  title: string;
  company_status?: string;
  company_type?: string;
  address_snippet?: string;
  date_of_creation?: string;
}

interface Officer {
  name: string;
  officer_role?: string;
  appointed_on?: string;
  resigned_on?: string;
  nationality?: string;
  occupation?: string;
}

interface PSC {
  name: string;
  kind?: string;
  natures_of_control?: string[];
  notified_on?: string;
  ceased_on?: string;
}

interface Filing {
  date?: string;
  category?: string;
  description?: string;
  type?: string;
}

interface Profile {
  company_name: string;
  company_number: string;
  company_status?: string;
  type?: string;
  date_of_creation?: string;
  registered_office_address?: Record<string, string>;
  sic_codes?: string[];
}

interface Detail {
  profile: Profile;
  officers: Officer[];
  psc: PSC[];
  filings: Filing[];
}

const statusColor = (s?: string) =>
  s === "active" ? "text-green-400 bg-green-400/10 border-green-400/20"
  : s === "dissolved" || s === "liquidation" ? "text-red-400 bg-red-400/10 border-red-400/20"
  : "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";

const fmtAddr = (a?: Record<string, string>) =>
  a ? [a.premises, a.address_line_1, a.address_line_2, a.locality, a.region, a.postal_code, a.country]
        .filter(Boolean).join(", ")
    : "";

type Tab = "officers" | "psc" | "filings";

export default function CompaniesDashboard() {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [detail, setDetail]   = useState<Detail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [searched, setSearched] = useState(false);
  const [tab, setTab]         = useState<Tab>("officers");

  const search = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true); setError(""); setDetail(null); setSearched(true);
    try {
      const res  = await fetch(`/api/companies?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Search failed"); setResults([]); }
      else setResults(json.results ?? []);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [query]);

  const open = useCallback(async (number: string) => {
    setLoading(true); setError(""); setTab("officers");
    try {
      const res  = await fetch(`/api/companies?number=${encodeURIComponent(number)}`);
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "Failed to load company");
      else setDetail(json);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  // ---- Detail view ----
  if (detail) {
    const p = detail.profile;
    const tabs: { id: Tab; label: string; icon: typeof Users; count: number }[] = [
      { id: "officers", label: "Officers", icon: Users,    count: detail.officers.length },
      { id: "psc",      label: "PSC",      icon: KeyRound,  count: detail.psc.length },
      { id: "filings",  label: "Filings",  icon: FileText,  count: detail.filings.length },
    ];
    return (
      <div className="p-6 space-y-5 max-w-5xl">
        <button onClick={() => setDetail(null)}
          className="flex items-center gap-1.5 text-xs text-[#64748b] hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to results
        </button>

        {/* Profile card */}
        <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-5 space-y-3">
          <div className="flex flex-wrap items-start gap-3">
            <h2 className="text-lg font-bold text-white flex-1">{p.company_name}</h2>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${statusColor(p.company_status)}`}>
              {p.company_status ?? "unknown"}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-[#94a3b8]">
            <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-[#64748b]" />{p.company_number}</span>
            {p.date_of_creation && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#64748b]" />Incorporated {p.date_of_creation}</span>}
            {p.type && <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-[#64748b]" />{p.type}</span>}
          </div>
          {p.registered_office_address && (
            <p className="flex items-start gap-1.5 text-xs text-[#94a3b8]">
              <MapPin className="w-3.5 h-3.5 text-[#64748b] mt-0.5 flex-shrink-0" />{fmtAddr(p.registered_office_address)}
            </p>
          )}
          {p.sic_codes?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {p.sic_codes.map(c => (
                <span key={c} className="text-[10px] font-mono text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-1.5 py-0.5 rounded">SIC {c}</span>
              ))}
            </div>
          ) : null}
          <a href={`https://find-and-update.company-information.service.gov.uk/company/${p.company_number}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-block text-[11px] text-cyan-400 hover:underline">View on Companies House &rarr;</a>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                tab === id ? "bg-cyan-400/10 border-cyan-400/30 text-cyan-400"
                           : "bg-white/5 border-[#1e2a3a] text-[#94a3b8] hover:text-white"}`}>
              <Icon className="w-3.5 h-3.5" />{label}<span className="text-[#64748b]">{count}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "officers" && (
          <div className="space-y-2">
            {detail.officers.map((o, i) => (
              <div key={i} className="rounded-xl border border-[#1e2a3a] bg-[#111827] px-4 py-3 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{o.name}</p>
                  <p className="text-xs text-[#64748b]">
                    {o.officer_role}{o.occupation ? ` · ${o.occupation}` : ""}{o.nationality ? ` · ${o.nationality}` : ""}
                  </p>
                </div>
                <div className="text-right text-xs text-[#64748b] flex-shrink-0">
                  {o.appointed_on && <p>Appointed {o.appointed_on}</p>}
                  {o.resigned_on && <p className="text-red-400">Resigned {o.resigned_on}</p>}
                </div>
              </div>
            ))}
            {!detail.officers.length && <Empty text="No officers listed" />}
          </div>
        )}

        {tab === "psc" && (
          <div className="space-y-2">
            {detail.psc.map((p, i) => (
              <div key={i} className="rounded-xl border border-[#1e2a3a] bg-[#111827] px-4 py-3 space-y-1.5">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-semibold text-white flex-1">{p.name}</p>
                  <span className="text-xs text-[#64748b]">
                    {p.notified_on && `Notified ${p.notified_on}`}
                    {p.ceased_on && <span className="text-red-400"> · Ceased {p.ceased_on}</span>}
                  </span>
                </div>
                {p.natures_of_control?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {p.natures_of_control.map(n => (
                      <span key={n} className="text-[10px] text-violet-300 bg-violet-400/10 border border-violet-400/20 px-1.5 py-0.5 rounded">
                        {n.replace(/-/g, " ")}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {!detail.psc.length && <Empty text="No persons with significant control listed" />}
          </div>
        )}

        {tab === "filings" && (
          <div className="space-y-2">
            {detail.filings.map((f, i) => (
              <div key={i} className="rounded-xl border border-[#1e2a3a] bg-[#111827] px-4 py-3 flex flex-wrap items-center gap-3">
                <span className="text-xs text-[#64748b] font-mono flex-shrink-0 w-24">{f.date}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{f.description?.replace(/\*\*/g, "") ?? f.type}</p>
                  {f.category && <p className="text-xs text-[#64748b] capitalize">{f.category.replace(/-/g, " ")}</p>}
                </div>
              </div>
            ))}
            {!detail.filings.length && <Empty text="No filing history" />}
          </div>
        )}
      </div>
    );
  }

  // ---- Search view ----
  return (
    <div className="p-6 space-y-5 max-w-5xl">
      <div className="flex items-center gap-2 bg-[#111827] border border-[#1e2a3a] rounded-xl px-3 py-2 max-w-xl">
        <Search className="w-4 h-4 text-[#64748b] flex-shrink-0" />
        <input
          type="text" value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && search()}
          placeholder="Search company name or number…"
          className="flex-1 bg-transparent text-sm text-white placeholder:text-[#64748b] outline-none"
        />
        {query && <button onClick={() => setQuery("")}><X className="w-3.5 h-3.5 text-[#64748b]" /></button>}
        <button onClick={search}
          className="text-xs font-medium px-3 py-1 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/20 transition-colors">
          Search
        </button>
      </div>

      <div className="rounded-xl border border-[#1e2a3a] bg-[#0d1224] p-4 text-xs text-[#94a3b8] leading-relaxed">
        <span className="text-cyan-400 font-semibold">UK Companies House</span> — official register of every company incorporated in the UK. Search by name or number to see status, registered address, officers, persons with significant control (PSC) and filing history.
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-400">{error}</div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-40">
          <RefreshCw className="w-6 h-6 text-[#64748b] animate-spin" />
        </div>
      )}

      <div className="space-y-2">
        {results.map(r => (
          <button key={r.company_number} onClick={() => open(r.company_number)}
            className="w-full text-left rounded-xl border border-[#1e2a3a] bg-[#111827] px-4 py-3 flex flex-wrap items-center gap-3 hover:bg-white/5 transition-colors">
            <Building2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{r.title}</p>
              <p className="text-xs text-[#64748b] truncate">{r.address_snippet}</p>
            </div>
            <span className="text-xs text-[#64748b] font-mono flex-shrink-0">{r.company_number}</span>
            {r.company_status && (
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border flex-shrink-0 ${statusColor(r.company_status)}`}>
                {r.company_status}
              </span>
            )}
          </button>
        ))}
        {searched && !loading && !error && results.length === 0 && (
          <Empty text={`No companies found for "${query}"`} />
        )}
      </div>

      <p className="text-xs text-[#64748b]">Source: Companies House public API · find-and-update.company-information.service.gov.uk</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-6 text-center text-[#64748b] text-sm">{text}</div>
  );
}
