"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useOnboardingStore } from "@/lib/store/onboarding-store";

export default function MatchesPage() {
  const profile = useOnboardingStore((state) => state.profile);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => setHasMounted(true), []);

  if (!hasMounted) return null;

  return (
    <div className="mx-auto max-w-lg pt-16 text-center">
      <span className="text-sm font-medium text-indigo-400">Step 3 of 3</span>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50">Matches are next</h1>
      <p className="mt-3 text-zinc-400">
        {profile
          ? `Your profile is ready, ${profile.roleInterest.toLowerCase()} — the ranked matches and AI-drafted pitches land here in the next build phase.`
          : "Once your profile is ready, ranked matches and AI-drafted pitches will land here."}
      </p>
      <Link
        href="/profile"
        className="mt-6 inline-flex rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 text-sm font-medium text-zinc-100 transition-colors hover:bg-white/[0.08]"
      >
        ← Back to profile
      </Link>
    </div>
  );
}
