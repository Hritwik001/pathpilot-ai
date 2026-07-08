"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import "./hero-scene.css";

export function HeroSceneCSS() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    function handlePointerMove(event: PointerEvent) {
      targetRef.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1,
      };
    }

    function tick() {
      const current = currentRef.current;
      const target = targetRef.current;
      current.x += (target.x - current.x) * 0.06;
      current.y += (target.y - current.y) * 0.06;

      sceneRef.current?.style.setProperty("--pointer-x", current.x.toFixed(4));
      sceneRef.current?.style.setProperty("--pointer-y", current.y.toFixed(4));

      frameRef.current = requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [prefersReducedMotion]);

  return (
    <div ref={sceneRef} className="hero-scene" aria-hidden>
      <div className="hero-scene__glow hero-scene__glow--one" />
      <div className="hero-scene__glow hero-scene__glow--two" />

      <div className="hero-scene__stage">
        <div className="hero-scene__card hero-scene__card--back">
          <div className="hero-scene__card-tilt" style={{ "--depth": "-120px", "--parallax": "14px" } as CSSProperties}>
            <span className="hero-scene__card-label">Ranked Matches</span>
            <div className="hero-scene__bar" style={{ width: "78%" }} />
            <div className="hero-scene__bar" style={{ width: "52%" }} />
          </div>
        </div>
        <div className="hero-scene__card hero-scene__card--mid">
          <div className="hero-scene__card-tilt" style={{ "--depth": "-40px", "--parallax": "22px" } as CSSProperties}>
            <span className="hero-scene__card-label">Structured Profile</span>
            <span className="hero-scene__pill">Frontend Engineer</span>
            <span className="hero-scene__pill">React · TypeScript</span>
          </div>
        </div>
        <div className="hero-scene__card hero-scene__card--front">
          <div className="hero-scene__card-tilt" style={{ "--depth": "60px", "--parallax": "34px" } as CSSProperties}>
            <span className="hero-scene__card-label">AI Pitch</span>
            <div className="hero-scene__typing">Generating your pitch…</div>
          </div>
        </div>
      </div>
    </div>
  );
}
