export function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-zinc-400 sm:flex-row">
        <span>PathPilot AI — a portfolio project by Hritwik Tiwary.</span>
        <div className="flex gap-6">
          <a
            href="https://github.com/Hritwik001/pathpilot-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-zinc-300"
          >
            GitHub
          </a>
          <a
            href="https://frontend-performance-portfolio.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-zinc-300"
          >
            Portfolio
          </a>
        </div>
      </div>
    </footer>
  );
}
