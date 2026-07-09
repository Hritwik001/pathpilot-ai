import { streamText } from "ai";
import { geminiFlash } from "@/lib/ai/gemini";
import { buildPitchPrompt } from "@/lib/ai/prompts";
import type { Profile } from "@/types/profile";

export async function POST(request: Request) {
  const { profile, roleTitle, reasoning } = (await request.json()) as {
    profile: Profile;
    roleTitle: string;
    reasoning: string;
  };

  const result = streamText({
    model: geminiFlash,
    prompt: buildPitchPrompt(profile, roleTitle, reasoning),
  });

  return result.toTextStreamResponse();
}
