import { CountUp } from "@/components/motion/CountUp";

const STATS = [
  { value: 12, suffix: "", label: "AI-ranked matches per batch" },
  { value: 60, suffix: "s", label: "From resume to structured profile" },
  { value: 0, suffix: "%", label: "Repeat suggestions, ever" },
];

export function Stats() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-28 sm:px-10 lg:px-16">
      <div className="grid gap-10 border-t border-white/10 pt-16 sm:grid-cols-3">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <span className="text-5xl font-semibold tracking-tight text-zinc-50">
              <CountUp value={stat.value} suffix={stat.suffix} />
            </span>
            <p className="mt-3 text-sm text-zinc-400">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
