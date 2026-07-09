import { generateObject } from "ai";
import { geminiFlash } from "@/lib/ai/gemini";
import { MatchBatchSchema } from "@/lib/ai/schemas";
import { buildMatchBatchPrompt } from "@/lib/ai/prompts";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/profile";
import type { Match } from "@/types/match";

type MatchRow = {
  id: string;
  role_title: string;
  reasoning: string;
  pitch: string | null;
  status: Match["status"];
  rank: number;
};

function rowToMatch(row: MatchRow): Match {
  return {
    id: row.id,
    rank: row.rank,
    roleTitle: row.role_title,
    reasoning: row.reasoning,
    status: row.status,
    pitch: row.pitch,
  };
}

export async function POST(request: Request) {
  const { profile, excludeRoles, force } = (await request.json()) as {
    profile: Profile;
    excludeRoles: string[];
    force?: boolean;
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let finalExcludeRoles = excludeRoles ?? [];

  if (user) {
    const { data: history } = await supabase.from("matches").select("role_title").eq("user_id", user.id);
    finalExcludeRoles = Array.from(new Set((history ?? []).map((row) => row.role_title as string)));

    if (!force) {
      const today = new Date().toISOString().slice(0, 10);
      const { data: todayMatches } = await supabase
        .from("matches")
        .select("id, role_title, reasoning, pitch, status, rank")
        .eq("user_id", user.id)
        .eq("batch_date", today)
        .order("rank", { ascending: true });

      if (todayMatches && todayMatches.length > 0) {
        return Response.json({ matches: (todayMatches as MatchRow[]).map(rowToMatch) });
      }
    }
  }

  const result = await generateObject({
    model: geminiFlash,
    schema: MatchBatchSchema,
    prompt: buildMatchBatchPrompt(profile, finalExcludeRoles),
  });

  const generated = result.object.matches.sort((a, b) => a.rank - b.rank);

  if (user) {
    const rows = generated.map((match) => ({
      user_id: user.id,
      role_title: match.roleTitle,
      reasoning: match.reasoning,
      rank: match.rank,
      status: "new" as const,
    }));

    const { data: inserted, error } = await supabase
      .from("matches")
      .insert(rows)
      .select("id, role_title, reasoning, pitch, status, rank");

    if (!error && inserted) {
      return Response.json({ matches: (inserted as MatchRow[]).map(rowToMatch) });
    }
  }

  const matches: Match[] = generated.map((match) => ({
    id: crypto.randomUUID(),
    rank: match.rank,
    roleTitle: match.roleTitle,
    reasoning: match.reasoning,
    status: "new",
    pitch: null,
  }));

  return Response.json({ matches });
}
