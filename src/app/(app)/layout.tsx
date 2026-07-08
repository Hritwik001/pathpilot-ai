import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050507]">
      <header className="px-6 py-6 sm:px-10 lg:px-16">
        <Link href="/" className="text-sm font-semibold tracking-tight text-zinc-50">
          PathPilot <span className="text-indigo-400">AI</span>
        </Link>
      </header>
      <main className="px-6 pb-24 sm:px-10 lg:px-16">{children}</main>
    </div>
  );
}
