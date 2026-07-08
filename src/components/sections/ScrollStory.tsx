"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STEPS = [
  {
    title: "Tell it who you are",
    body: "Chat through a few quick questions or upload your resume — PathPilot reads it in seconds.",
  },
  {
    title: "Get a structured profile",
    body: "Skills, experience, and notable projects, extracted and editable before anything moves forward.",
  },
  {
    title: "See ranked matches, with reasons",
    body: "8–12 role types, each with a plain-English reason it fits, plus a pitch ready to send.",
  },
];

export function ScrollStory() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const card = cardRef.current;
      if (!card) return;

      gsap.set(card, { scale: 0.62, rotate: -8, opacity: 0.35, willChange: "transform, opacity" });
      gsap.set(stepRefs.current, { opacity: 0, y: 24, willChange: "transform, opacity" });

      // One timeline "unit" per step. Each step fades in over the first 20% of its
      // unit, stays fully visible (the "plateau") for the middle 60%, then fades out
      // over the last 20%. Snap points sit at each plateau's center, so at rest the
      // scroll always lands on a fully-visible, settled step — never mid-transition —
      // which is what makes steps 1 -> 2 -> 3 read as discrete rather than a single
      // continuous blend tied 1:1 to raw scroll distance.
      const stepUnit = 1;
      const stepCount = stepRefs.current.filter(Boolean).length;

      const snapPoints = stepRefs.current
        .filter(Boolean)
        .map((_, index) => (index + 0.5) / stepCount);

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=250%",
          scrub: true,
          pin: true,
          anticipatePin: 1,
          snap: {
            snapTo: snapPoints,
            duration: 0.4,
            ease: "power2.inOut",
          },
        },
      });

      timeline.to(card, { scale: 1, rotate: 0, opacity: 1, ease: "none", duration: stepUnit * 0.7 }, 0);

      stepRefs.current.forEach((el, index) => {
        if (!el) return;
        const start = index * stepUnit;
        timeline.to(el, { opacity: 1, y: 0, duration: stepUnit * 0.2, ease: "none" }, start);
        if (index < stepRefs.current.length - 1) {
          timeline.to(el, { opacity: 0, y: -24, duration: stepUnit * 0.2, ease: "none" }, start + stepUnit * 0.8);
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <section id="how-it-works" className="mx-auto max-w-3xl px-6 py-32 sm:px-10">
        <div className="space-y-16">
          {STEPS.map((step, index) => (
            <div key={step.title}>
              <span className="text-sm font-medium text-indigo-400">0{index + 1}</span>
              <h2 className="mt-3 text-2xl font-semibold text-zinc-50">{step.title}</h2>
              <p className="mt-3 text-zinc-400">{step.body}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="how-it-works" ref={sectionRef} className="relative h-screen overflow-hidden">
      <div className="mx-auto grid h-full max-w-6xl items-center gap-16 px-6 sm:px-10 lg:grid-cols-2 lg:px-16">
        <div className="relative flex items-center justify-center">
          <div
            ref={cardRef}
            className="relative flex h-72 w-72 flex-col items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/20 via-white/[0.03] to-cyan-400/20 shadow-[0_40px_100px_-30px_rgba(99,102,241,0.5)]"
          >
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-300">
              How it works
            </span>
          </div>
        </div>

        <div className="relative h-56">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              ref={(el) => {
                stepRefs.current[index] = el;
              }}
              className="absolute inset-0"
            >
              <span className="text-sm font-medium text-indigo-400">0{index + 1}</span>
              <h2 className="mt-3 text-3xl font-semibold text-zinc-50">{step.title}</h2>
              <p className="mt-4 max-w-md text-lg text-zinc-400">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
