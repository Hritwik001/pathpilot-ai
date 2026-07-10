import { generateObject } from "ai";
import { geminiFlash } from "@/lib/ai/gemini";
import { ProfileSchema } from "@/lib/ai/schemas";
import { createStatusReporter } from "@/lib/realtime/status";
import type { ChatAnswers } from "@/lib/ai/mock";

export async function POST(request: Request) {
  const { answers, statusChannel } = (await request.json()) as {
    answers: ChatAnswers;
    statusChannel?: string;
  };

  const reporter = await createStatusReporter(statusChannel);
  reporter.send("Turning your answers into a profile…");

  const result = await generateObject({
    model: geminiFlash,
    schema: ProfileSchema,
    prompt: `A candidate answered four onboarding questions for a career-matching app. Turn their raw answers into a clean, structured profile.

Role they want next: ${answers.roleInterest}
Years of experience (raw): ${answers.yearsExperience}
Strongest skills (raw, comma-separated): ${answers.skills}
Preferences (raw): ${answers.preferences}

Parse the years of experience into a whole number. Clean up, deduplicate, and title-case the skills into a short array. Write a polished experience summary in 2-3 sentences. Leave notableProjects as an empty array since none were provided in a chat-only onboarding.`,
  });

  await reporter.close();

  return Response.json({ profile: { ...result.object, source: "chat" as const } });
}
