import { MagneticButton } from "@/components/motion/MagneticButton";

export function CTASection() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-32 text-center sm:px-10">
      <h2 className="text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
        Stop guessing what&apos;s next.
      </h2>
      <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-400">
        Two minutes gets you a structured profile and a ranked list of roles worth pursuing —
        with reasons you can actually use.
      </p>
      <div className="mt-10 flex justify-center">
        <MagneticButton href="/onboarding" variant="primary">
          Start free
        </MagneticButton>
      </div>
    </section>
  );
}
