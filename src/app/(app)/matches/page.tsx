"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useOnboardingStore } from "@/lib/store/onboarding-store";
import { useMatchesStore } from "@/lib/store/matches-store";
import { MatchCard } from "@/components/matches/MatchCard";

export default function MatchesPage() {
  const profile = useOnboardingStore((state) => state.profile);
  const matches = useMatchesStore((state) => state.matches);
  const setMatches = useMatchesStore((state) => state.setMatches);
  const allSeenRoleTitles = useMatchesStore((state) => state.allSeenRoleTitles);

  const [hasMounted, setHasMounted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestedRef = useRef(false);

  useEffect(() => setHasMounted(true), []);

  async function generateMatches(excludeRoles: string[], force = false) {
    if (!profile) return;
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch("/api/matches/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, excludeRoles, force }),
      });
      if (!response.ok) throw new Error("match generation failed");
      const data = await response.json();
      setMatches(data.matches);
    } catch {
      setError("Couldn't generate matches right now — try refreshing.");
    } finally {
      setIsGenerating(false);
    }
  }

  useEffect(() => {
    if (!hasMounted || !profile || requestedRef.current) return;
    if (matches.length === 0) {
      requestedRef.current = true;
      generateMatches([], false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMounted, profile]);

  if (!hasMounted) return null;

  if (!profile) {
    return (
      <div className="mx-auto max-w-lg pt-16 text-center">
        <h1 className="text-2xl font-semibold text-zinc-50">No profile yet</h1>
        <p className="mt-3 text-zinc-400">
          Start onboarding first so PathPilot has something to match against.
        </p>
        <Link
          href="/onboarding"
          className="mt-6 inline-flex rounded-full bg-zinc-50 px-6 py-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-white"
        >
          Start onboarding
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-2xl pt-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-sm font-medium text-indigo-400">Step 3 of 3</span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            Your ranked matches
          </h1>
          <p className="mt-3 text-zinc-400">
            Expand any of the top 3 for an AI-drafted pitch you can copy and send.
          </p>
        </div>
        {matches.length > 0 && !isGenerating && (
          <button
            type="button"
            onClick={() => generateMatches(allSeenRoleTitles(), true)}
            className="whitespace-nowrap rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.06]"
          >
            Refresh matches
          </button>
        )}
      </div>

      {isGenerating && matches.length === 0 && (
        <div className="mt-10 flex items-center gap-3 text-sm text-zinc-400">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-cyan-400"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          Generating your matches…
        </div>
      )}

      {error && matches.length === 0 && <p className="mt-10 text-sm text-rose-400">{error}</p>}

      <div className="mt-8 space-y-4">
        {matches.map((match, index) => (
          <MatchCard key={match.id} match={match} profile={profile} canGeneratePitch={index < 3} />
        ))}
      </div>
    </motion.div>
  );
}
