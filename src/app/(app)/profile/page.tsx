"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useOnboardingStore } from "@/lib/store/onboarding-store";
import { ProfileCard } from "@/components/profile/ProfileCard";

export default function ProfilePage() {
  const profile = useOnboardingStore((state) => state.profile);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => setHasMounted(true), []);

  if (!hasMounted) return null;

  if (!profile) {
    return (
      <div className="mx-auto max-w-lg pt-16 text-center">
        <h1 className="text-2xl font-semibold text-zinc-50">No profile yet</h1>
        <p className="mt-3 text-zinc-400">
          Start onboarding first — chat or upload a resume — and your profile will show up here.
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
      <span className="text-sm font-medium text-indigo-400">Step 2 of 3</span>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
        Here&apos;s what we picked up
      </h1>
      <p className="mt-3 text-zinc-400">
        Edit anything that&apos;s off before we generate your matches.
      </p>

      <div className="mt-8">
        <ProfileCard profile={profile} />
      </div>

      <div className="mt-8 flex justify-end">
        <Link
          href="/matches"
          className="rounded-full bg-zinc-50 px-7 py-3.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-white"
        >
          See my matches
        </Link>
      </div>
    </motion.div>
  );
}
