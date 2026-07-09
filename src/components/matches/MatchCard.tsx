"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMatchesStore } from "@/lib/store/matches-store";
import type { Match } from "@/types/match";
import type { Profile } from "@/types/profile";

export function MatchCard({
  match,
  profile,
  canGeneratePitch,
}: {
  match: Match;
  profile: Profile;
  canGeneratePitch: boolean;
}) {
  const updateStatus = useMatchesStore((state) => state.updateStatus);
  const setPitch = useMatchesStore((state) => state.setPitch);

  const [expanded, setExpanded] = useState(false);
  const [streamingPitch, setStreamingPitch] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const isActioned = match.status !== "new";

  async function generatePitch() {
    setExpanded(true);
    if (match.pitch || isStreaming) return;

    setIsStreaming(true);
    setStreamingPitch("");

    try {
      const response = await fetch(`/api/matches/${match.id}/pitch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, roleTitle: match.roleTitle, reasoning: match.reasoning }),
      });

      if (!response.body) throw new Error("no stream body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setStreamingPitch(text);
      }

      setPitch(match.id, text);
    } catch {
      setStreamingPitch("Couldn't generate a pitch right now — try again in a moment.");
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <motion.div
      layout
      className={`rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-opacity ${
        isActioned ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-indigo-400">
            #{match.rank}
          </span>
          <h3 className="mt-1 text-lg font-semibold text-zinc-50">{match.roleTitle}</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">{match.reasoning}</p>
        </div>
        {isActioned && (
          <span className="whitespace-nowrap rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
            {match.status === "applied" ? "Applied" : "Dismissed"}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {canGeneratePitch && (
          <button
            type="button"
            onClick={() => (expanded ? setExpanded(false) : generatePitch())}
            className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-2 text-xs font-medium text-indigo-300 transition-colors hover:bg-indigo-500/20"
          >
            {expanded ? "Hide pitch" : match.pitch ? "Show pitch" : "Generate pitch"}
          </button>
        )}
        {!isActioned && (
          <>
            <button
              type="button"
              onClick={() => updateStatus(match.id, "applied")}
              className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.06]"
            >
              Mark applied
            </button>
            <button
              type="button"
              onClick={() => updateStatus(match.id, "dismissed")}
              className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-white/[0.06]"
            >
              Dismiss
            </button>
          </>
        )}
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-zinc-300">
              {match.pitch || streamingPitch || (isStreaming ? "Thinking…" : "")}
              {isStreaming && (
                <motion.span
                  className="ml-1 inline-block h-3 w-1.5 bg-cyan-400 align-middle"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
