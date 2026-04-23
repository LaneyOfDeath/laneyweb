"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquarePlus, X, Send } from "lucide-react";

type State = "idle" | "sending" | "sent" | "error";

export default function FeedbackButton() {
  const pathname = usePathname();
  const [open, setOpen]       = useState(false);
  const [message, setMessage] = useState("");
  const [state, setState]     = useState<State>("idle");

  async function submit() {
    if (!message.trim() || state === "sending") return;
    setState("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, page: pathname }),
      });
      setState(res.ok ? "sent" : "error");
      if (res.ok) {
        setMessage("");
        setTimeout(() => { setOpen(false); setState("idle"); }, 1500);
      }
    } catch {
      setState("error");
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => { setOpen(true); setState("idle"); }}
        className="fixed top-3 right-3 z-50 flex items-center gap-2 px-3 py-2 rounded-xl
                   bg-[#111827] border border-[#1e2a3a] text-[#64748b] text-xs font-medium
                   hover:text-cyan-400 hover:border-cyan-500/30 transition-all duration-200 shadow-lg"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
      >
        <MessageSquarePlus className="w-4 h-4" />
        <span>Feedback</span>
      </button>

      {/* Modal backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) { setOpen(false); setState("idle"); } }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-[#1e2a3a] bg-[#0d1224] p-5 space-y-4"
            style={{ boxShadow: "0 0 40px rgba(0,0,0,0.6)" }}>

            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Leave feedback</p>
              <button onClick={() => { setOpen(false); setState("idle"); }}
                className="p-1 text-[#64748b] hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && e.metaKey) submit(); }}
              placeholder="What's on your mind?"
              rows={4}
              className="w-full bg-[#111827] border border-[#1e2a3a] rounded-xl px-3 py-2.5 text-sm
                         text-white placeholder:text-[#64748b] outline-none resize-none
                         focus:border-cyan-500/40 transition-colors"
              autoFocus
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#64748b]">{pathname}</span>
              <button
                onClick={submit}
                disabled={!message.trim() || state === "sending" || state === "sent"}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                           bg-cyan-500/20 text-cyan-400 border border-cyan-500/30
                           hover:bg-cyan-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                {state === "sending" ? "Sending…" : state === "sent" ? "Sent!" : "Send"}
              </button>
            </div>

            {state === "error" && (
              <p className="text-xs text-red-400">Something went wrong — try again.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
