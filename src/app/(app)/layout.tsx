import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[#050507]">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10 lg:px-16">
        <Link href="/" className="text-sm font-semibold tracking-tight text-zinc-50">
          PathPilot <span className="text-indigo-400">AI</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link href="/history" className="text-zinc-400 transition-colors hover:text-zinc-100">
                History
              </Link>
              <span className="hidden text-zinc-500 sm:inline">{user.email}</span>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="rounded-full border border-white/10 px-4 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.06]"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-white/10 px-4 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.06]"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>
      <main className="px-6 pb-24 sm:px-10 lg:px-16">{children}</main>
    </div>
  );
}
