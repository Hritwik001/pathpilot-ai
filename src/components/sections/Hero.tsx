import { RevealText } from "@/components/motion/RevealText";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { HeroScene } from "@/components/hero/HeroScene";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-6 pt-28 pb-20 sm:px-10 lg:px-16">
      <HeroScene />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-medium tracking-wide text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            AI Career Copilot
          </span>

          <h1 className="mt-7 text-5xl font-semibold leading-[1.05] tracking-tight text-zinc-50 sm:text-6xl lg:text-7xl">
            <RevealText text="Know your next move" />
            <br />
            <RevealText
              text="before you make it."
              delay={0.15}
              className="bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent"
            />
          </h1>

          <p className="mt-7 max-w-lg text-lg leading-relaxed text-zinc-400">
            Tell PathPilot who you are — by chat or resume — and get ranked roles with a plain
            reason for every match, plus a pitch ready to send. Free, fast, and never the same
            batch twice.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <MagneticButton href="/onboarding" variant="primary">
              Start free
            </MagneticButton>
            <MagneticButton href="#how-it-works" variant="secondary">
              See how it works
            </MagneticButton>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-zinc-500">
        <div className="flex h-9 w-6 items-start justify-center rounded-full border border-white/15 p-1.5">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" />
        </div>
      </div>
    </section>
  );
}
