"use client";

import { motion } from "framer-motion";

export function ModeSelect({
  onSelectChat,
  onSelectResume,
}: {
  onSelectChat: () => void;
  onSelectResume: () => void;
}) {
  return (
    <div>
      <span className="text-sm font-medium text-indigo-400">Step 1 of 3</span>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
        How do you want to start?
      </h1>
      <p className="mt-3 max-w-lg text-zinc-400">
        Either works — a quick chat or your existing resume gets you to the same place: a
        structured profile you can edit before anything else happens.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <motion.button
          type="button"
          onClick={onSelectChat}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="group rounded-2xl border border-white/10 bg-white/[0.03] p-7 text-left transition-colors hover:border-indigo-400/40 hover:bg-white/[0.05]"
        >
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-zinc-500">
            Fastest
          </span>
          <h2 className="mt-3 text-xl font-semibold text-zinc-50">Chat with PathPilot</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Answer four quick questions — about 60 seconds — and we&apos;ll build your profile
            from that.
          </p>
        </motion.button>

        <motion.button
          type="button"
          onClick={onSelectResume}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="group rounded-2xl border border-white/10 bg-white/[0.03] p-7 text-left transition-colors hover:border-cyan-400/40 hover:bg-white/[0.05]"
        >
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-zinc-500">
            Most complete
          </span>
          <h2 className="mt-3 text-xl font-semibold text-zinc-50">Upload your resume</h2>
          <p className="mt-2 text-sm text-zinc-400">
            PDF in, structured profile out — skills, experience, and notable projects extracted
            automatically.
          </p>
        </motion.button>
      </div>
    </div>
  );
}
