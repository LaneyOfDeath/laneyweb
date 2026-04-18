"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Shield, Search, X, ChevronDown, ChevronUp } from "lucide-react";

interface Vuln {
  cveId: string;
  vendor: string;
  product: string;
  name: string;
  dateAdded: string;
  description: string;
  action: string;
  dueDate: string;
}

export default function CyberDashboard() {
  const [vulns, setVulns]       = useState<Vuln[]>([]);
  const [count, setCount]       = useState(0);
  const [catalog, setCatalog]   = useState("");
  const [loading, setLoading]   = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [search, setSearch]     = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/cyber?limit=80");
      const json = await res.json();
      setVulns(json.vulnerabilities ?? []);
      setCount(json.count ?? 0);
      setCatalog(json.catalogVersion ?? "");
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = search
    ? vulns.filter(v =>
        v.cveId.toLowerCase().includes(search.toLowerCase()) ||
        v.vendor.toLowerCase().includes(search.toLowerCase()) ||
        v.product.toLowerCase().includes(search.toLowerCase()) ||
        v.name.toLowerCase().includes(search.toLowerCase())
      )
    : vulns;

  return (
    <div className="p-6 space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-400/10 border border-red-400/20">
          <Shield className="w-4 h-4 text-red-400" />
          <span className="text-sm font-semibold text-red-400">{count.toLocaleString()} known exploited CVEs</span>
        </div>
        {catalog && <span className="text-xs text-[#64748b]">v{catalog}</span>}
        <div className="ml-auto flex items-center gap-3 text-xs text-[#64748b]">
          {lastUpdate && <span>Updated {lastUpdate.toLocaleTimeString()}</span>}
          <button onClick={fetchData} className="p-2 bg-white/5 border border-[#1e2a3a] rounded-xl text-[#94a3b8] hover:text-white transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-[#111827] border border-[#1e2a3a] rounded-xl px-3 py-2 max-w-md">
        <Search className="w-4 h-4 text-[#64748b] flex-shrink-0" />
        <input
          type="text" value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter by CVE, vendor, product…"
          className="flex-1 bg-transparent text-sm text-white placeholder:text-[#64748b] outline-none"
        />
        {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-[#64748b]" /></button>}
      </div>

      {/* Intro card */}
      <div className="rounded-xl border border-[#1e2a3a] bg-[#0d1224] p-4 text-xs text-[#94a3b8] leading-relaxed">
        <span className="text-red-400 font-semibold">CISA KEV (Known Exploited Vulnerabilities)</span> — vulnerabilities confirmed to be actively exploited in the wild. Federal agencies are required to patch these by the due date. Showing the 80 most recently added.
      </div>

      {loading && !vulns.length && (
        <div className="flex items-center justify-center h-40">
          <RefreshCw className="w-6 h-6 text-[#64748b] animate-spin" />
        </div>
      )}

      {/* Vuln list */}
      <div className="space-y-2">
        {filtered.map(v => {
          const isOpen = expanded === v.cveId;
          const isOverdue = v.dueDate && new Date(v.dueDate) < new Date();
          return (
            <div key={v.cveId} className="rounded-xl border border-[#1e2a3a] bg-[#111827] overflow-hidden">
              <button
                className="w-full px-4 py-3 flex flex-wrap items-center gap-3 hover:bg-white/5 transition-colors text-left"
                onClick={() => setExpanded(isOpen ? null : v.cveId)}
              >
                <span className="text-[11px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded font-mono flex-shrink-0">{v.cveId}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{v.name}</p>
                  <p className="text-xs text-[#64748b]">{v.vendor} · {v.product}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-[#64748b]">Added {v.dateAdded}</span>
                  {isOverdue && (
                    <span className="text-[11px] text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded border border-orange-400/20">Overdue</span>
                  )}
                  {isOpen ? <ChevronUp className="w-4 h-4 text-[#64748b]" /> : <ChevronDown className="w-4 h-4 text-[#64748b]" />}
                </div>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 border-t border-[#1e2a3a] pt-3 space-y-3">
                  <p className="text-xs text-[#94a3b8] leading-relaxed">{v.description}</p>
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <p className="text-[10px] text-[#64748b] uppercase tracking-widest">Required Action</p>
                      <p className="text-xs text-white mt-0.5">{v.action}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#64748b] uppercase tracking-widest">Due Date</p>
                      <p className={`text-xs mt-0.5 ${isOverdue ? "text-orange-400" : "text-white"}`}>{v.dueDate}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {!loading && filtered.length === 0 && (
          <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-6 text-center text-[#64748b] text-sm">
            {search ? `No results for "${search}"` : "No vulnerability data available"}
          </div>
        )}
      </div>

      <p className="text-xs text-[#64748b]">Source: CISA Known Exploited Vulnerabilities Catalog · cisa.gov · Free public feed</p>
    </div>
  );
}
