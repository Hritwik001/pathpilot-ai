import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ProfileRow = {
  role_interest: string;
  years_experience: number;
  experience_summary: string;
};

type MatchRow = {
  id: string;
  role_title: string;
  reasoning: string;
  status: "new" | "applied" | "dismissed";
  batch_date: string;
  rank: number;
};

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/history");

  const [{ data: profile }, { data: matches }] = await Promise.all([
    supabase
      .from("profiles")
      .select("role_interest, years_experience, experience_summary")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("matches")
      .select("id, role_title, reasoning, status, batch_date, rank")
      .eq("user_id", user.id)
      .order("batch_date", { ascending: false })
      .order("rank", { ascending: true }),
  ]);

  const batches = new Map<string, MatchRow[]>();
  for (const row of (matches as MatchRow[] | null) ?? []) {
    const list = batches.get(row.batch_date) ?? [];
    list.push(row);
    batches.set(row.batch_date, list);
  }

  const savedProfile = profile as ProfileRow | null;

  return (
    <div className="mx-auto max-w-2xl pt-8">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">Your history</h1>
      <p className="mt-3 text-zinc-400">Your saved profile and every batch of matches you&apos;ve generated.</p>

      {savedProfile && (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-xs font-medium uppercase tracking-[0.15em] text-zinc-500">Saved profile</h2>
          <p className="mt-3 text-lg font-semibold text-zinc-50">{savedProfile.role_interest}</p>
          <p className="mt-1 text-sm text-zinc-400">{savedProfile.years_experience} years experience</p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">{savedProfile.experience_summary}</p>
        </div>
      )}

      <div className="mt-10 space-y-8">
        {Array.from(batches.entries()).map(([date, rows]) => (
          <div key={date}>
            <h3 className="text-sm font-medium text-zinc-500">{date}</h3>
            <div className="mt-3 space-y-3">
              {rows.map((row) => (
                <div key={row.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-zinc-100">{row.role_title}</span>
                    <span className="whitespace-nowrap text-xs text-zinc-500">{row.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-400">{row.reasoning}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        {batches.size === 0 && (
          <p className="text-sm text-zinc-500">No matches yet — head to onboarding to get started.</p>
        )}
      </div>
    </div>
  );
}
