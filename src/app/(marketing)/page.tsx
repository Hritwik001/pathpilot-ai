import { Hero } from "@/components/sections/Hero";
import { ScrollStory } from "@/components/sections/ScrollStory";
import { Stats } from "@/components/sections/Stats";
import { CTASection } from "@/components/sections/CTASection";

export default function MarketingPage() {
  return (
    <>
      <Hero />
      <ScrollStory />
      <Stats />
      <CTASection />
    </>
  );
}
