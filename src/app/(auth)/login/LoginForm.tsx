"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/profile";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function sendMagicLink(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setStatus(error ? "error" : "sent");
  }

  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-sm pt-16"
    >
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">Sign in</h1>
      <p className="mt-3 text-sm text-zinc-400">
        Save your profile and matches so they&apos;re there next time you visit.
      </p>

      <button
        type="button"
        onClick={signInWithGoogle}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-5 py-3 text-sm font-medium text-zinc-100 transition-colors hover:bg-white/[0.08]"
      >
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-3 text-xs text-zinc-600">
        <div className="h-px flex-1 bg-white/10" />
        or
        <div className="h-px flex-1 bg-white/10" />
      </div>

      {status === "sent" ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-zinc-300">
          Check <span className="text-zinc-100">{email}</span> for a sign-in link.
        </p>
      ) : (
        <form onSubmit={sendMagicLink} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-indigo-400/50"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-full bg-zinc-50 px-5 py-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-white disabled:opacity-50"
          >
            {status === "sending" ? "Sending…" : "Email me a sign-in link"}
          </button>
          {status === "error" && (
            <p className="text-sm text-rose-400">Something went wrong — try again.</p>
          )}
        </form>
      )}
    </motion.div>
  );
}
