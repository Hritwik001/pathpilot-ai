import Link from "next/link";
import { MagneticButton } from "@/components/motion/MagneticButton";

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-6 pt-6 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-zinc-950/85 px-5 py-3">
        <Link href="/" className="text-sm font-semibold tracking-tight text-zinc-50">
          PathPilot <span className="text-indigo-400">AI</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-zinc-400 sm:flex">
          <Link href="#how-it-works" className="transition-colors hover:text-zinc-100">
            How it works
          </Link>
          <a
            href="https://github.com/Hritwik001/pathpilot-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-zinc-100"
          >
            GitHub
          </a>
        </nav>
        <div className="scale-90 origin-right">
          <MagneticButton href="/onboarding" variant="secondary">
            Start free
          </MagneticButton>
        </div>
      </div>
    </header>
  );
}
