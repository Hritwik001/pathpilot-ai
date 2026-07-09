import { generateObject } from "ai";
import { geminiFlash } from "@/lib/ai/gemini";
import { MatchBatchSchema } from "@/lib/ai/schemas";
import { buildMatchBatchPrompt } from "@/lib/ai/prompts";
import type { Profile } from "@/types/profile";

export async function POST(request: Request) {
  const { profile, excludeRoles } = (await request.json()) as {
    profile: Profile;
    excludeRoles: string[];
  };

  const result = await generateObject({
    model: geminiFlash,
    schema: MatchBatchSchema,
    prompt: buildMatchBatchPrompt(profile, excludeRoles ?? []),
  });

  const matches = result.object.matches
    .sort((a, b) => a.rank - b.rank)
    .map((match) => ({
      id: crypto.randomUUID(),
      rank: match.rank,
      roleTitle: match.roleTitle,
      reasoning: match.reasoning,
      status: "new" as const,
      pitch: null as string | null,
    }));

  return Response.json({ matches });
}
