"use client";

import dynamic from "next/dynamic";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { HeroSceneCSS } from "./HeroSceneCSS";

const HeroScene3D = dynamic(() => import("./HeroScene3D").then((mod) => mod.HeroScene3D), {
  ssr: false,
  loading: () => <HeroSceneCSS />,
});

const ENABLE_3D_HERO = process.env.NEXT_PUBLIC_ENABLE_3D_HERO === "true";

export function HeroScene() {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (!ENABLE_3D_HERO || prefersReducedMotion) {
    return <HeroSceneCSS />;
  }

  return <HeroScene3D />;
}
